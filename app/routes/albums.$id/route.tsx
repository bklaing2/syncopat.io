import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import styles from "./styles.module.css";

import type { Loaded } from "~/types";
import { Supabase, user } from "~/database/supabase.server";
import Modal from "~/components/modal/Modal";
import Details from "~/components/details/Details";


export type Album = Loaded<typeof loader>['album']


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const albumId = params.id
  if (!albumId) throw new Error("Album ID not supplied");

  const { supabase, headers } = Supabase(request)
  const { id: userId, signedIn } = await user(supabase)
  if (!signedIn) throw redirect('/signin', { headers })

  const { data, error } = await supabase
    .from('albums')
    .select(`
      id,
      title,
      songs(
        id,
        title,
        albums(id, title, artists(id, name)),
        artists(id, name)
      ),
      artists(
        id,
        name,
        songs(id, title),
        albums(id, title),
        collaborators(user_info(id, email), role)
      ),
      collaborators(user_info(id, email), role)
    `)
    .eq('id', albumId)
    .limit(1)
    .single()


  if (error) throw json(error.message)
  if (!data) throw json("Album not found", { status: 404 });


  type Album = typeof data
  type Song = Album['songs'][number]
  type SongAlbum = Song['albums'][number]
  type SongArtist = Song['artists'][number]
  type Artist = Album['artists'][number]

  type AlbumCollab = Album['collaborators'][number]
  type ArtistCollab = Artist['collaborators'][number]
  type RawCollab = AlbumCollab | ArtistCollab


  const flattenCollabs = (arr: RawCollab[], a: Album | Artist) => ([ ...arr, ...a.collaborators ])
  const flattenCollab = (c: RawCollab) => ({
    id: c.user_info?.id,
    email: c.user_info?.email,
    role: c.role
  })

  type FlatCollab = ReturnType<typeof flattenCollab>
  type Collaborator = { [P in keyof FlatCollab]: NonNullable<FlatCollab[P]> }

  const removeNull = (c: FlatCollab): c is Collaborator => !!c.id || !!c.email
  const currentUser = (c: RawCollab) => (c.user_info?.id === userId)


  const transformSongAlbum = (a: SongAlbum) => ({ id: a.id, title: a.title })
  const flattenSongArtists = (arr: SongArtist[], a: SongAlbum) => ([ ...arr, ...a.artists ])

  const transformSong = (s: Song) => ({
    id: s.id,
    title: s.title,
    albums: s.albums.map(transformSongAlbum),
    artists: [ ...s.artists, ...s.albums.reduce(flattenSongArtists, []) ]
  })

  const transformArtist = (a: Artist) => ({ 
    id: a.id,
    name: a.name,
    songs: a.songs,
    albums: a.albums,
    role: a.collaborators.find(currentUser)?.role || 'viewer'
  })


  const collabAlbums = data.collaborators
  const collabArtists = data.artists.reduce(flattenCollabs, [])
  const collaborators = [ ...collabAlbums, ...collabArtists ]

  const album = {
    id: data.id,
    title: data.title,
    songs: data.songs.map(transformSong),
    artists: data.artists.map(transformArtist),
    collaborators: collabAlbums.map(flattenCollab).filter(removeNull),
    role: collaborators.find(currentUser)?.role || 'viewer'
  }

  
  return json({ album: album }, { headers });
};


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const albumId = params.id
  if (!albumId) throw new Error("Album ID not supplied");

  const { supabase, headers } = Supabase(request)
  
  const form = await request.formData()
  const title = form.get('title')

  if (request.method === 'PATCH') {
    const { error } = await supabase
      .from('albums')
      .update({ title: title as string })
      .eq('id', albumId)

    if (error) throw json(error)
    return new Response(null, { status: 204, headers })
  }


  if (request.method === 'DELETE') {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId)

    if (!error) return redirect('/albums', { headers })
  }

  return new Response(null, { status: 405, headers })
};



export default function Album () {
  const { album } = useLoaderData<typeof loader>();
  const role = album.role


  return (
    <Modal
      titleProps={{
        name: "title",
        placeholder: "Album Title",
        value: album.title,
        action: `/albums/${album.id}`,
        disabled: role !== 'owner' && role !== 'editor'
      }}
      subtitle="album settings"
      deleteAction={role === 'owner' ? `/albums/${album.id}` : undefined}
      className={styles.layout}
    >
      <Details
        of="album"
        id={album.id}
        role={role || 'viewer'}
        songs={album.songs}
        artists={album.artists}
        collaborators={album.collaborators}
      />
    </Modal>
  )
}