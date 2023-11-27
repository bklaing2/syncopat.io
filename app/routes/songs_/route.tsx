import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import styles from "~/styles/main.module.css";

import { Supabase, user } from "~/database/supabase.server";
import { List, SongListItem, CreateListItem } from "~/components/list";


export async function loader ({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = Supabase(request)
  if (!(await user(supabase)).signedIn) throw redirect('/signin', { headers })
  
  const { data, error } = await supabase
    .from('songs')
    .select(`
      id,
      title,
      albums(id, title),
      artists(id, name)
    `)
    .order('modified_at', { ascending: false })
      

  if (error) throw json(error.message)
  if (!data) throw json("No songs found", { status: 404 })

  return json({ songs: data }, { headers })
}


export async function action ({ params, request }: ActionFunctionArgs) {
  const { supabase, headers } = Supabase(request)
  
  const form = await request.formData()
  const albumId = form.get('albumId')
  const artistId = form.get('artistId')
  
  if (request.method === 'POST') {
    const { data, error } = await supabase
      .from('songs')
      .insert({})
      .select('id')
      .limit(1)
      .single()

    if (error) throw json(error.message)
    const song_id = data?.id

    if (albumId) await supabase
      .from('album_songs')
      .insert({ song_id: song_id, album_id: albumId as any as number })

    if (artistId) await supabase
      .from('artist_songs')
      .insert({ song_id: song_id, artist_id: artistId as any as number })
      
    if (form.has('redirect') && form.get('redirect') === '0')
      return new Response(null, { status: 201, headers })

    return redirect(`/songs/${data?.id}`, { headers })
  }


  throw new Response(null, { status: 405, headers })
}


export default function Songs() {
  const { songs } = useLoaderData<typeof loader>();
  const Songs = songs.map(s => <SongListItem song={s} key={s.id} />)

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Songs</h1>

      <List className={styles.list}>
        { Songs }
        <CreateListItem of="song" />
      </List>
    </div>
  );
}