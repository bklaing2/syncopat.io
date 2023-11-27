import { json, type ActionFunctionArgs } from "@remix-run/node";
import type { Role } from "~/types";
import { Supabase, inviteUser } from "~/database/supabase.server";


export async function action ({ params, request }: ActionFunctionArgs) {
  const type = params.type
  if (!type) throw new Error("Type not supplied");
  if (type !== 'songs' && type !== 'albums' && type !== 'artists')
    throw new Error("Unaccepted type supplied");

  const id = params.id
  if (!id) throw new Error("ID not supplied");

  const { supabase, headers } = Supabase(request)

  const form = await request.formData()
  const email = form.get('email')
  const role = form.get('role')

  if (!email) throw new Error("Email not supplied");
  if (!role) throw new Error("Role not supplied");

  if (request.method === 'POST') {
    const { data: collaborator_added, error } = await supabase.rpc('collaborator_add', {
      email: email as string,
      role: role as Role,
      of: type === 'songs' ? 'song' : type === 'albums' ? 'album' : 'artist',
      id: id as any as number
    })

    if (!collaborator_added) {
      const { data, error: invite_error } = await inviteUser(request, email as string, `/${type}/${id}`)
      console.log(data, invite_error)
      if (invite_error) throw json(invite_error)

      const { data: collaborator_added, error } = await supabase.rpc('collaborator_add', {
        email: email as string,
        role: role as Role,
        of: type === 'songs' ? 'song' : type === 'albums' ? 'album' : 'artist',
        id: id as any as number
      })

      console.log(collaborator_added, error)

      if (error) throw json(error)
      return new Response(null, { status: 204, headers })
    }


    if (error) throw json(error)
    return new Response(null, { status: 204, headers })
  }


  return new Response(null, { status: 405, headers })
}