import { createServerClient, parse, serialize } from '@supabase/ssr'
import type { Database } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'


export function Supabase (request: Request, service = false) {
  const cookies = parse(request.headers.get('Cookie') ?? '')
  const headers = new Headers()

  const supabase = createServerClient<Database>(
    process.env.SUPABASE_URL!,
    service ? process.env.SUPABASE_SERVICE_KEY! : process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key) { return cookies[key] },
        set(key, value, options) { headers.append('Set-Cookie', serialize(key, value, options)) },
        remove(key, options) { headers.append('Set-Cookie', serialize(key, '', options)) },
      }
    }
  )

  return { supabase, headers }
}


export async function user(supabase: SupabaseClient) {
  const { data: { session } } = await supabase.auth.getSession()
  return { id: session?.user?.id, signedIn: !!session }
}


export async function inviteUser(request: Request, email: string, redirect?: string) {
  const { supabase } = Supabase(request, true)
  return await supabase.auth.admin.inviteUserByEmail(email, { redirectTo: redirect })
}