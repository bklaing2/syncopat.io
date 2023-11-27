import { Link, NavLink } from "@remix-run/react";
import type { Session } from "@supabase/supabase-js";

import styles from "./styles.module.css";
import { List, ListItem } from "../list";
import { splitEmail } from "~/util/email";


interface Props { session?: Session | null }
export default function Navigation({ session }: Props) {
  const signedIn = !!session?.user

  return <div className={styles.container}>
    <List className={styles.navbar}>
      <ListItem className="ignore">
        <h1 className={styles.title}>
          <span className={styles.decoration}>𝄆</span>
          <Link to="/">s<span>yncopat.io</span></Link>
          <span className={styles.decoration}>𝄇</span>
        </h1>
      </ListItem>

      <ListItem><NavItem to="/songs" text="songs" /></ListItem>
      <ListItem><NavItem to="/albums" text="albums" /></ListItem>
      <ListItem><NavItem to="/artists" text="artists" /></ListItem>


      { signedIn ? <Link to="/profile" className={styles.email}>{splitEmail(session?.user.email)[0]}</Link> : <>
        <Link to="/signup" className={styles.link}>Sign&nbsp;up</Link>
        <Link to="/signin" className={styles.link}>Sign&nbsp;in</Link>
      </>}
    </List>
  </div>
}


interface NavItemProps { to: string; text: string; }
function NavItem ({ to, text }: NavItemProps) {
  return (
    <NavLink
      className={({ isActive, isPending }) =>
        `${styles.navLink} ${isActive && styles.active} ${isPending && styles.pending}`
      }
      to={to}
      prefetch="intent"
    >{text}</NavLink>
  );
}