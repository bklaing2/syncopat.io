import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

import styles from "~/styles/main.module.css";

import type { OutletContext } from "~/types";
import { Supabase, user } from "~/database/supabase.server";
import { List, AlbumListItem, CreateListItem } from "~/components/list";


export async function loader ({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = Supabase(request)
  const { id: userId, signedIn } = await user(supabase)
  if (!signedIn) throw redirect('/signin', { headers })

  const { data, error } = await supabase
    .from('albums')
    .select(`
      id,
      title,
      songs(id, title),
      artists(
        id,
        name,
        collaborators(user_info(id, email), role)
      ),
      collaborators(user_info(id, email), role)
    `)
    .order('modified_at', { foreignTable: 'songs', ascending: false })

  if (error) throw json(error.message)
  if (!data) throw json("Album not found", { status: 404 });


  type Album = typeof data[number]
  type AlbumArtist = Album['artists'][number]

  type AlbumCollab = Album['collaborators'][number]
  type AlbumArtistCollab = AlbumArtist['collaborators'][number]
  type RawCollab = AlbumCollab  | AlbumArtistCollab


  const flattenCollabs = (arr: RawCollab[], a: Album | AlbumArtist) => ([ ...arr, ...a.collaborators ])
  const currentUser = (c: RawCollab) => (c.user_info?.id === userId)

  const transformAlbumArtist = (a: AlbumArtist) => ({  id: a.id, name: a.name })
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

  return json({ albums: data.map(transformAlbum), }, { headers });
}


export async function action ({ params, request }: ActionFunctionArgs) {
  const { supabase, headers } = Supabase(request)
  
  const form = await request.formData()
  const artistId = form.get('artistId')

  if (request.method === 'POST') {
    const { data, error } = await supabase
      .from('albums')
      .insert({})
      .select('id')
      .limit(1)
      .single()
    
    if (error) throw json(error.message)
    const album_id = data?.id
    
    if (album_id) await supabase
      .from('artist_albums')
      .insert({ album_id: album_id, artist_id: artistId as any as number })
    
    if (form.has('redirect') && form.get('redirect') === '0')
      return new Response(null, { status: 201, headers })
    
    return redirect(`/albums/${data?.id}`, { headers })
  }


  throw new Response(null, { status: 405, headers })
}


export default function Albums() {
  const { session } = useOutletContext<OutletContext>()
  const { albums } = useLoaderData<typeof loader>();
  const Albums = albums.map(a => <AlbumListItem album={a} key={a.id} />)
  
  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Albums</h1>

      <List className={styles.list}>
        { Albums }
        <CreateListItem of="album" />
      </List>

      <Outlet context={{ session: session }}/>
    </div>
  )
}