import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createServerClient, parse, serialize } from '@supabase/ssr'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const form = await request.formData();
  
  const cookies = parse(request.headers.get('Cookie') ?? '')
  const headers = new Headers()

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(key) { return cookies[key] },
      set(key, value, options) { headers.append('Set-Cookie', serialize(key, value, options)) },
      remove(key, options) { headers.append('Set-Cookie', serialize(key, '', options)) },
    },
  })

  const { error } = await supabase.auth.signOut()
  console.log(error)

  console.log('USER SIGN OUT')
  console.log(await supabase.auth.getUser())


  return redirect('/', { headers })
};