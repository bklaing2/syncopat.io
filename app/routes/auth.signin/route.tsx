import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { Supabase } from "~/database/supabase.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { supabase, headers } = Supabase(request)
  const form = await request.formData();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: form.get('email') as string,
    password: form.get('password') as string
  })


  return redirect('/', { headers })
};