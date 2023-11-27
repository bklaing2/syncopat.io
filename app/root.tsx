import { cssBundleHref } from "@remix-run/css-bundle";
import type { MetaFunction, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import setupStylesHref from "./styles/setup.css";
import appStylesHref from "./styles/app.css";

import { Supabase } from "./database/supabase.server";
import Navigation from "./components/navigation/Navigation";



export const meta: MetaFunction = () => {
  return [
    { title: "syncopat.io" },
    { name: "description", content: "Collaborate on lyric writing in realtime" },
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" }
  ];
};

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: setupStylesHref },
  { rel: "stylesheet", href: appStylesHref }
];


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, headers } = Supabase(request)
  const env = { SUPABASE_URL: process.env.SUPABASE_URL!, SUPABASE_PUBLIC_KEY: process.env.SUPABASE_ANON_KEY! };
  const { data: { session } } = await supabase.auth.getSession()

  return json({ env, session }, { headers })
};



export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  
  const [ supabase ] = useState(() => createBrowserClient(env.SUPABASE_URL, env.SUPABASE_PUBLIC_KEY));

  const serverAccessToken = session?.access_token;

  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) revalidate()
    })

    return subscription.unsubscribe;
  }, [supabase.auth, serverAccessToken, revalidate]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation session={session} />
        <Outlet context={{ supabase, session }} />

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
