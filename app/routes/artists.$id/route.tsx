import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import styles from "./styles.module.css";

import { Supabase, user } from "~/database/supabase.server";
import type { Loaded } from "~/types";
import Modal from "~/components/modal/Modal";
import Details from "~/components/details/Details";


export type Artist = Loaded<typeof loader>['artist']


export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const albumId = params.id
  if (!albumId) throw new Error("Album ID not supplied");

  const { supabase, headers } = Supabase(request)
  const { id: userId, signedIn } = await user(supabase)
  if (!signedIn) throw redirect('/signin', { headers })

  const { data, error } = await supabase
    .from('artists')
    .select(`
      id,
      name,
      songs(
        id,
        title,
        albums(id, title, artists(id, name)),
        artists(id, name)
      ),
      albums(
        id,
        title,
        songs(id, title),
        artists(
          id,
          name,
          collaborators(user_info(id, email), role)
        ),
        collaborators(user_info(id, email), role)
      ),
      collaborators(user_info(id, email), role)
    `)
    .eq('id', albumId)
    .limit(1)
    .single()


  if (error) throw json(error.message)
  if (!data) throw json("Album not found", { status: 404 });


  type Artist = typeof data
  type Album = Artist['albums'][number]
  type AlbumArtist = Album['artists'][number]

  type Song = Artist['songs'][number]
  type SongAlbum = Song['albums'][number]
  type SongArtist = Song['artists'][number]

  type AlbumCollab = Album['collaborators'][number]
  type AlbumArtistCollab = AlbumArtist['collaborators'][number]
  type ArtistCollab = Artist['collaborators'][number]
  type RawCollab = AlbumCollab | ArtistCollab | AlbumArtistCollab


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


  const transformSongAlbum = (a: SongAlbum) => ({ id: a.id, title: a.title })
  const flattenSongArtists = (arr: SongArtist[], a: SongAlbum) => ([ ...arr, ...a.artists ])

  const transformSong = (s: Song) => ({
    id: s.id,
    title: s.title,
    albums: s.albums.map(transformSongAlbum),
    artists: [ ...s.artists, ...s.albums.reduce(flattenSongArtists, []) ]
  })

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


  const artist = {
    id: data.id,
    name: data.name,
    songs: data.songs.map(transformSong),
    albums: data.albums.map(transformAlbum),
    collaborators: data.collaborators.map(flattenCollab).filter(removeNull),
    role: data.collaborators.find(currentUser)?.role || 'viewer'
  }

  
  return json({ artist: artist }, { headers });
};


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const artistId = params.id
  if (!artistId) throw new Error("Artist ID not supplied");

  const { supabase, headers } = Supabase(request)
  
  const form = await request.formData()
  const name = form.get('name')

  if (request.method === 'PATCH') {
    const { error } = await supabase
      .from('artists')
      .update({ name: name as string })
      .eq('id', artistId)

    if (error) throw json(error)
    return new Response(null, { status: 204, headers })
  }


  if (request.method === 'DELETE') {
    const { error } = await supabase
      .from('artists')
      .delete()
      .eq('id', artistId)

    if (!error) return redirect('/artists', { headers })
  }

  return new Response(null, { status: 405, headers })
};



export default function Artist() {
  const { artist } = useLoaderData<typeof loader>();
  const role = artist.role

  return (
    <Modal
      titleProps={{
        name: "name",
        placeholder: "Artist Name",
        value: artist.name,
        action: `/artists/${artist.id}`,
        disabled: role !== 'owner' && role !== 'editor'
      }}
      subtitle="artist settings"
      deleteAction={role === 'owner' ? `/artists/${artist.id}` : undefined}
      className={styles.layout}
    >
      <Details
        of="artist"
        id={artist.id}
        role={role || 'viewer'}
        songs={artist.songs}
        albums={artist.albums}
        collaborators={artist.collaborators}
      />
    </Modal>
  )
}