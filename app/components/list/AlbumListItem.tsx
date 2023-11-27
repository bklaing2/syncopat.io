import { Link } from "@remix-run/react";
import type { Song, Artist } from "~/types"
import styles from "./album.module.css";
import { List, CreateListItem } from ".";


type Album = Song['albums'][number] | Artist['albums'][number]
interface AlbumListItemProps { album: Album, collapsed?: boolean }

export default function AlbumListItem ({ album, collapsed }: AlbumListItemProps) {  
  const Songs = album.songs && album.songs.map(s => <SongListItem song={s} key={s.id} /> )
  const Artist = album.artists && album.artists[0]

  const canEdit = album.role === 'owner' || album.role === 'editor'

  return <li className={styles.album} data-collapsed={collapsed}>
    { Artist && <Link className={styles.artist} to={`/artists/${Artist.id}`}>{Artist.name}</Link> }

    <Link className={styles.title} to={`/albums/${album.id}`}>
      {album.title}
    </Link>
    
    { canEdit && <Link to={`/albums/${album.id}/settings`} className={styles.settings}>⋮</Link> }


    <List className={styles.songs}>
      <div className={styles.header}>
        <h6>Songs</h6>
        { canEdit && <CreateListItem of='song' albumId={album.id} className={styles.addItem} /> }
      </div>
      { Songs }
    </List>
  </li>
}



interface SongListItemProps { song: Album['songs'][number] }
function SongListItem ({ song }: SongListItemProps) {
  return <li className={styles.song}>
    <Link to={`/songs/${song.id}`}>{song.title}</Link>
  </li>
}