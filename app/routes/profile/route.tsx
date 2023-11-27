import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import styles from "./styles.module.css";
import { Supabase } from "~/database/supabase.server";
import Password from "~/components/forms/Password";


export async function loader ({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = Supabase(request)

  const { data: { session } } = await supabase.auth.getSession()
  console.log(session)

  if (!session) return redirect('/signin', { headers })
  return new Response(null, { headers })
}


export default function Profile() {
  return <>
    <Password type="update" />

    <Form className={styles.signout} action="/auth/signout" method="post">
      <button type="submit" >Sign&nbsp;out</button>
    </Form>
  </>
}