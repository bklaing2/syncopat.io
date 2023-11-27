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


interface CreateListItemProps {
  of: keyof typeof ACTIONS,
  albumId?: number,
  artistId?: number,
  collapsed?: boolean,
  className?: string
}

export default function CreateListItem ({ of, albumId, artistId, collapsed, className = '' }: CreateListItemProps) {
  const fetcher = useFetcher()

  const classType =
    of === 'song' ? songStyles.song :
    of === 'album' ? albumStyles.album :
    artistStyles.artist
  
  return <li className={`${classType} ${styles.wireframe} ${className}`} data-collapsed={collapsed}>
    <fetcher.Form action={ACTIONS[of]} method="post">
      <input type="hidden" name="redirect" value={0} />
      { albumId && <input type="hidden" name="albumId" value={albumId} /> }
      { artistId && <input type="hidden" name="artistId" value={artistId} /> }
      <button type="submit">+</button>
    </fetcher.Form>
  </li>
}