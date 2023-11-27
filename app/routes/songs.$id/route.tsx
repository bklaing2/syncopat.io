import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useState, type KeyboardEvent } from "react";
import type { RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

import styles from "./styles.module.css";
import sectionStyles from "./section.module.css";
import type { Loaded, OutletContext } from "~/types";

import { prefs } from "../../cookies.server";
import { Supabase, user } from "~/database/supabase.server";
import { List } from "~/components/list";
import Header from "./Header";
import Section, { AddSection } from "./Section";


export type Song = Loaded<typeof loader>['song']


export async function loader ({ params, request }: LoaderFunctionArgs) {
  const songId = params.id
  if (!songId) throw new Error("Song ID not supplied");

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await prefs.parse(cookieHeader)) || {};
  const { supabase, headers } = Supabase(request)
  const { id: userId, signedIn } = await user(supabase)
  if (!signedIn) throw redirect('/signin', { headers })
  

  const { data, error } = await supabase
    .from('songs')
    .select(`
      id,
      title,
      sections,
      albums(
        id,
        title,
        songs(id, title),
        artists(
          id,
          name,
          songs(id, title),
          albums(id, title, songs(id, title)),
          collaborators(user_info(id, email), role)
        ),
        collaborators(user_info(id, email), role)
      ),
      artists(
        id,
        name,
        songs(id, title),
        albums(id, title, songs(id, title)),
        collaborators(user_info(id, email), role)
      ),
      collaborators(user_info(id, email), role)
    `)
    .eq('id', songId)
    .limit(1)
    .single()


  if (error) {
    if (error.code === 'PGRST116') throw json("Song not found", { status: 404 });
    throw json(error.message)
  }
  if (!data) throw json("Song not found", { status: 404 });


  type Song = typeof data
  type Album = Song['albums'][number]
  type SongArtist = Song['artists'][number]
  type AlbumArtist = Album['artists'][number]
  type Artist = SongArtist | AlbumArtist

  type SongCollab = Song['collaborators'][number]
  type AlbumCollab = Album['collaborators'][number]
  type ArtistCollab = Artist['collaborators'][number]
  type AlbumArtistCollab = AlbumArtist['collaborators'][number]
  type RawCollab = SongCollab | AlbumCollab | AlbumArtistCollab | ArtistCollab


  const flattenCollabs = (arr: RawCollab[], a: Album | Artist | AlbumArtist) => ([ ...arr, ...a.collaborators ])
  const flattenCollab = (c: RawCollab) => ({
    id: c.user_info?.id,
    email: c.user_info?.email,
    role: c.role
  })

  type FlatCollab = ReturnType<typeof flattenCollab>
  type Collaborator = { [P in keyof FlatCollab]: NonNullable<FlatCollab[P]> }

  const removeNull = (c: FlatCollab): c is Collaborator => !!c.id || !!c.email
  const currentUser = (c: RawCollab) => (c.user_info?.id === userId)


  const transformAlbumArtist = (a: Artist) => ({ 
    id: a.id,
    name: a.name,
    songs: a.songs,
    albums: a.albums,
    role: a.collaborators.find(currentUser)?.role || 'viewer'
  })

  const transformAlbum = (a: Album) => ({
    id: a.id,
    title: a.title,
    songs: a.songs,
    artists: a.artists.map(transformAlbumArtist),
    role: [
      ...a.collaborators,
      ...a.artists.reduce(flattenCollabs, [])
    ].find(currentUser)?.role || 'viewer'
  })


  const flattenArtists = (arr: ReturnType<typeof transformAlbumArtist>[], a: ReturnType<typeof transformAlbum>) => ([ ...arr, ...a.artists ])
  const flattenAlbumArtists = (arr: AlbumArtist[], a: Album) => [ ...arr, ...a.artists ]


  const collabSongs = data.collaborators
  const collabAlbums = data.albums.reduce(flattenCollabs, [])
  const collabArtists = data.artists.reduce(flattenCollabs, [])
  const collabAlbumArtists = data.albums.reduce(flattenAlbumArtists, []).reduce(flattenCollabs, [])
  const collaborators = collabSongs.concat(collabAlbums).concat(collabArtists).concat(collabAlbumArtists)

  const albums = data.albums.map(transformAlbum)
  const artists = data.artists.map(transformAlbumArtist)
  const albumArtists = albums.reduce(flattenArtists, [])


  const song = {
    id: data.id,
    title: data.title,
    sections: data.sections,
    albums: albums,
    artists: [ ...artists, ...albumArtists ],
    collaborators: collabSongs.map(flattenCollab).filter(removeNull),
    role: collaborators.find(currentUser)?.role || 'viewer'
  }


  return json({ song: song, collapsedSections: cookie.collapsedSections as string[] }, { headers });
}


export async function action ({ params, request }: ActionFunctionArgs) {
  const songId = params.id
  if (!songId) throw new Error("Song ID not supplied");

  const { supabase, headers } = Supabase(request)

  const form = await request.formData()
  const title = form.get('title')

  if (request.method === 'PATCH') {
    const { error } = await supabase
      .from('songs')
      .update({ title: title as string })
      .eq('id', songId)

    if (error) throw json(error)
    return new Response(null, { status: 204, headers })
  }


  if (request.method === 'DELETE') {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)

    if (error) throw json(error)
    return redirect('/songs', { headers })
  }

  throw new Response(null, { status: 405, headers })
}



export default function Song() {
  const { session } = useOutletContext<OutletContext>()
  // const fetcher = useFetcher();
  const { song: loadedSong, /* collapsedSections */ } = useLoaderData<typeof loader>();
  const [ song, setSong ] = useState<Song>(loadedSong)

  const [ advancedEdit, setAdvancedEdit ] = useState(false)
  const { supabase } = useOutletContext<OutletContext>();

  useEffect(() => {
    setSong(loadedSong)
  }, [ loadedSong ])


  useEffect(() => {
    const channel = supabase
      .channel("*")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "songs", filter: `id=eq.${song.id}` }, handleSongUpdated)
      .subscribe();
    
    function handleSongUpdated (payload: RealtimePostgresUpdatePayload<{ [key: string]: any; }>) {
      const updatedSong = { ...song, ...payload.new }
      setSong({ ...updatedSong })
    }
    return () => { supabase.removeChannel(channel) }
  }, [song, song.id, supabase]);


  


  function handleSectionKeydown(e: KeyboardEvent<HTMLTextAreaElement>, dir: 'up' | 'down' | 'left' | 'right') {
    const content = (e.target as any).value as string
    const offset = (e.target as any).selectionStart as number
    const allLines = content.split('\n')
    
    const lineIndex = content.substring(0, offset).split('\n').length - 1


    if (dir === 'up' && lineIndex > 0) return
    if (dir === 'down' && lineIndex < allLines.length - 1) return
    if (dir === 'left' && offset > 0) return
    if (dir === 'right' && offset < content.length) return

    const textAreas = document.getElementsByClassName(sectionStyles.content)
    let i: number
    for (i = 0; i < textAreas.length; i++) {
      if (textAreas[i] === document.activeElement) break
    }

    // const i = textAreas.findIndex(s => s === document.activeElement)
    if (i === 0 && dir === 'up') return
    if (i === textAreas.length - 1 && dir === 'down') return
    e.preventDefault()

    const textArea = textAreas[dir === 'up' || dir === 'left' ? i - 1 : i + 1] as HTMLInputElement
    

    const column = offset - content.substring(0, offset).lastIndexOf('\n') - 1
    const cursor =
      dir === 'up' ? textArea.value.lastIndexOf('\n') + column + 1 :
      dir === 'down' ? Math.min(column, textArea.value.indexOf('\n')) :
      dir === 'left' ? textArea.value.length :
      0
      
      
    textArea.selectionStart = cursor
    textArea.selectionEnd = cursor
    textArea.focus()
  }

  // if (fetcher.formData?.has("collapsed"))
  //   collapsedSections = fetcher.formData.getAll("collapsed") as string[];


  const canEdit = song.role === 'owner' || song.role === 'editor'


  const Sections = song.sections.map((s, i) => <Section
    id={song.id}
    section={s}
    index={i}
    canEdit={canEdit}
    onArrowKey={handleSectionKeydown}
    key={s?.id} />
  )
    
  return <>
    <div className={styles.layout} data-advanced-edit={advancedEdit}>
      <Header song={song} canEdit={canEdit} />

      <List className={styles.sections}>
        { song.sections.length === 0 && <AddSection id={song.id} position={0} className={styles.addSection} /> }
        { Sections }
      </List>


      { canEdit && <>
        <input
          className="hide"
          type="checkbox"
          name="advanced-edit"
          checked={advancedEdit}
          onClick={() => setAdvancedEdit(!advancedEdit)}
          readOnly
        />
        <label
          className={styles.advancedEdit}
          htmlFor="advanced-edit"
          onClick={() => setAdvancedEdit(!advancedEdit)}
        >🛠️</label>
      </> }
    </div>


    <Outlet context={{ song: song, session: session }} />
  </>
}