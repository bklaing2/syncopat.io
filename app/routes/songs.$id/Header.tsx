import { Link } from "@remix-run/react";
import styles from "./header.module.css";
import type { Song } from "~/types"
import Input from "~/components/realtime/Input";

interface Props { song: Song; canEdit?: boolean }

export default function Header ({ song }: Props) {  
  const canEdit = song.role === 'owner' || song.role === 'editor'


  return <>
    <Input
      name="title"
      placeholder="Song Title"
      value={song.title}
      action={`/songs/${song.id}`}
      disabled={!canEdit}
      className={styles.title}
    />

    { canEdit && <>
      <span className={styles.role}>{song.role}</span>
      <Link to={`/songs/${song.id}/settings`} className={styles.settings}>⚙&#xFE0E;</Link>
    </> }
  </>
}