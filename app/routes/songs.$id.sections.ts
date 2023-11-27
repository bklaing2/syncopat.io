import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Supabase } from "~/database/supabase.server";


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const songId = params.id
  if (!songId) throw new Error("Song ID not supplied");

  const { supabase, headers } = Supabase(request)
  const form = await request.formData();

  const type = form.has('type') ? form.get('type') as string : undefined
  const content = form.has('content') ? form.get('content') as string : undefined
  const linked = form.has('linked') ? form.getAll('linked').includes('1') : undefined

  const section = { type: type, content: content, linked: linked }


  if (request.method === 'POST') {
    const { error } = await supabase.rpc('song_section_add', {
      section: section,
      index: undefined as any as number,
      song_id: songId as any as number
    })
    
    if (error) return json(error, { status: 500, headers })
    return new Response(null, { status: 201, headers })
  }


  return new Response(null, { status: 405, headers })
};