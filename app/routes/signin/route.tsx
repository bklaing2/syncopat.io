import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import styles from "./styles.module.css";
import { Supabase } from "~/database/supabase.server";


export async function loader ({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = Supabase(request)
  const { data: { session } } = await supabase.auth.getSession()

  if (session) return redirect('/', { headers })
  return new Response(null, { headers })
}


export default function SignIn() {
  return <Form className="auth-form" action="/auth/signin" method="post">
    <label htmlFor="email">Email</label>
    <input type="email" name="email" placeholder="Email..."></input>
    <label htmlFor="email">Password</label>
    <input type="password" name="password" placeholder="Password..."></input>
    <button type="submit" >Sign&nbsp;in</button>
  </Form>
}