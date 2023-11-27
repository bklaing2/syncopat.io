import type { ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

import styles from "~/styles/main.module.css";
import { Supabase, user } from "~/database/supabase.server";
import { List, ArtistListItem, CreateListItem } from "~/components/list";
import type { Artist, OutletContext } from "~/types";


export async function loader ({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = Supabase(request)
  const { id: userId, signedIn } = await user(supabase)
  if (!signedIn) throw redirect('/signin', { headers })

  const { data, error } = await supabase
    .from('artists')
    .select(`
      id,
      name,
      songs(id, title),
      albums(id, title),
      collaborators(user_info(id, email), role)
    `)


  if (error) throw json(error.message)
  if (!data) throw json("No artists Found", { status: 404 });


  type Artist = typeof data[number]
  type RawCollab = Artist['collaborators'][number]

  const currentUser = (c: RawCollab) => (c.user_info?.id === userId)

  const transformArtist = (a: Artist) => ({
    id: a.id,
    name: a.name,
    songs: a.songs,
    albums: a.albums,
    role: a.collaborators.find(currentUser)?.role || 'viewer'
  })


  return json({ artists: data.map(transformArtist) }, { headers });
}


export async function action ({ request }: ActionFunctionArgs) {
  const { supabase, headers } = Supabase(request)

  if (request.method === 'POST') {
    const { data, error } = await supabase
      .from('artists')
      .insert({})
      .select('id')
      .limit(1)
      .single()

    console.log(data, error)
      
    if (error) throw json(error.message)
    return redirect(`/artists/${data?.id}`, { headers })
  }


  throw new Response(null, { status: 405, headers })
}


export default function Artists() {
  const { session } = useOutletContext<OutletContext>();
  const { artists } = useLoaderData<typeof loader>();
  
  const Artists = artists.map(b => <ArtistListItem artist={b as Artist} key={b.id} />)
  
  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>Artists</h1>

      <List className={styles.list}>
        { Artists }
        <CreateListItem of="artist" />
      </List>

      <Outlet context={{ session: session }} />
    </div>
  );
}
