import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import Password from "~/components/forms/Password";
import { Supabase } from "~/database/supabase.server";


// export async function loader ({ request }: LoaderFunctionArgs) {
//   const { supabase, headers } = Supabase(request)
//   const { data: { session } } = await supabase.auth.getSession()

//   if (session) return redirect('/', { headers })
//   return new Response(null, { headers })
// }


export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { supabase, headers } = Supabase(request)

  const form = await request.formData()
  const password = form.get('password')
  const passwordConfirm = form.get('password-confirm')

  if (!password || !passwordConfirm) throw new Error("Password not supplied")
  if (password !== passwordConfirm) throw new Error("Passwords do not match")

  const { data, error } = await supabase.auth.updateUser({ password: password as string })

  console.log(data, error)
  if (error) throw json(error.message)

  if (form.has('redirect'))
    return redirect(form.get('redirect') as string, { headers })
  
  return new Response(null, { status: 201, headers })
};


export default function UpdatePassword() {
  return <Password type="update" />
}