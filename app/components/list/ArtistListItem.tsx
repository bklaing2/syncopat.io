import { Link } from "@remix-run/react";
import styles from "./artist.module.css";
import { List, CreateListItem } from ".";
import type { Song, Album } from "~/types"


type Artist = Song['artists'][number] | Album['artists'][number]
interface ArtististItemProps { artist: Artist; collapsed?: boolean }

export default function ArtistListItem ({ artist, collapsed }: ArtististItemProps) {  
  const albums = artist.albums?.map(a => <AlbumListItem album={a} key={a.id} /> )
  const songs = artist.songs?.map(s => <SongListItem song={s} key={s.id} /> )

  const role = artist.role
  const canEdit = role !== 'viewer'


  return <li className={styles.artist} data-collapsed={collapsed}>    
    <Link className={styles.title} to={`/artists/${artist.id}`}>
      {artist.name}
    </Link>
    
    { canEdit && <Link to={`/artists/${artist.id}/settings`} className={styles.settings}>⋮</Link> }


    <List className={styles.list}>
      <div className={styles.header}>
        <h6>Albums</h6>
        { canEdit && <CreateListItem of='album' artistId={artist.id} className={styles.addItem} /> }
      </div>
      { albums }

      <div className={styles.header}>
        <h6>Songs</h6>
        { canEdit && <CreateListItem of='song' artistId={artist.id} className={styles.addItem} /> }
      </div>
      { songs }
    </List>
  </li>
}


interface AlbumListItemProps { album: Artist['albums'][number] }
function AlbumListItem ({ album }: AlbumListItemProps) {
  return <li className={styles.item}>
    <Link to={`/albums/${album.id}`}>{album.title}</Link>
  </li>
}


interface SongListItemProps { song: Artist['songs'][number] }
function SongListItem ({ song }: SongListItemProps) {
  return <li className={styles.item}>
    <Link to={`/songs/${song.id}`}>{song.title}</Link>
  </li>
}