import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Supabase } from "~/database/supabase.server";
import type { Role } from "~/types";


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const type = params.type
  if (!type) throw new Error("Type not supplied");
  if (type !== 'songs' && type !== 'albums' && type !== 'artists')
    throw new Error("Unaccepted type supplied");

  const id = params.id
  if (!id) throw new Error("Song ID not supplied");

  const userId = params.uid
  if (!userId) throw new Error("User ID not supplied");

  const { supabase, headers } = Supabase(request)
  
  const form = await request.formData();
  const role = form.get('role')

  const column =
    type === 'songs' ? 'song_id' :
    type === 'albums' ? 'album_id' :
    'artist_id'

  if (request.method === 'PATCH') {
    const { error } = await supabase
      .from('collaborators')
      .update({ role: role as Role })
      .eq('user_id', userId)
      .eq(column, id)
    
    if (error) return json(error, { status: 500, headers })
    return new Response(null, { status: 201, headers })
  }

  if (request.method === 'DELETE') {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('user_id', userId)
      .eq(column, id)
    
    if (error) return json(error, { status: 500, headers })
    return new Response(null, { status: 204, headers })
  }


  return new Response(null, { status: 405, headers })
};