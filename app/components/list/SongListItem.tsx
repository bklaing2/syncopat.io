import { Link } from "@remix-run/react";
import styles from "./song.module.css";
import type { Artist, Album } from "~/types";

type Song = Album['songs'][number] | Artist['songs'][number]
interface SongListItemProps { song: Song }

export default function SongListItem ({ song }: SongListItemProps) {
  const album = song.albums && song.albums[0]
  const artist = song.artists && song.artists[0]
  const canEdit = true
  
  return <li className={styles.song}>
    { artist && <Link className={styles.artist} to={`/artists/${artist.id}`}>{artist.name}</Link> }

    <Link className={styles.title} to={`/songs/${song.id}`}>
      {song.title}
    </Link>
    
    { canEdit && <Link to={`/songs/${song.id}/settings`} className={styles.settings} >⋮</Link> }
    { album && <Link className={styles.album} to={`/albums/${album.id}`}>{album.title}</Link> }
  </li>
}