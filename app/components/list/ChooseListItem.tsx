import { useFetcher } from "@remix-run/react";
import styles from "./styles.module.css";
import songStyles from "./song.module.css";
import albumStyles from "./album.module.css";
import artistStyles from "./artist.module.css";


const ACTIONS = {
  song: '/songs',
  album: '/albums',
  artist: '/artists'
}


interface ChooseListItemProps {
  type: keyof typeof ACTIONS,
  albumId?: number,
  artistId?: number,
  collapsed?: boolean,
  className?: string
}

export default function ChooseListItem ({ type, albumId, artistId, collapsed, className = '' }: ChooseListItemProps) {
  const fetcher = useFetcher()

  const classType =
    type === 'song' ? songStyles.song :
    type === 'album' ? albumStyles.album :
    artistStyles.artist
  
  return <li className={`${classType} ${styles.wireframe} ${className}`} data-collapsed={collapsed}>
    <fetcher.Form action={ACTIONS[type]} method="post">
      <input type="hidden" name="redirect" value={0} />
      { albumId && <input type="hidden" name="albumId" value={albumId} /> }
      { artistId && <input type="hidden" name="artistId" value={artistId} /> }
      <button type="submit">+</button>
    </fetcher.Form>
  </li>
}