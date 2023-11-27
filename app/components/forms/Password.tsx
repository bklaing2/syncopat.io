import { useFetcher } from "@remix-run/react"

interface Props { type: 'update' | 'set'; redirect?: string }

export default function Password({ type, redirect }: Props) {
  const fetcher = useFetcher()

  return <>
    <fetcher.Form className="auth-form" action="/auth/update-password" method="post">
      { redirect && <input type="hidden" name="redirect" value={redirect} /> }
      <label htmlFor="password">{type} password</label>
      <input type="password" name="password" placeholder="password..." />
      <label htmlFor="password-confirm">confirm password</label>
      <input type="password" name="password-confirm" placeholder="password..." />
      <button type="submit" >{type}&nbsp;password</button>
    </fetcher.Form>
  </>
}