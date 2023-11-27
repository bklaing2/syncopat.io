import type { Role } from "~/components/collaborator/types";
import styles from "./styles.module.css";
import { List, SongListItem, AlbumListItem, ArtistListItem, CreateListItem } from "~/components/list";
import { Collaborator, ExternalCollaborators, AddCollaborator } from "~/components/collaborator";
import type { Song, Album, Artist, OutletContext } from "~/types";
import { useOutletContext } from "@remix-run/react";



interface Props {
  of: 'song' | 'album' | 'artist'
  id: number
  role: Role
  songs?: Album['songs'] | Artist['songs']
  albums?: Song['albums'] | Artist['albums']
  artists?: Song['artists'] | Album['artists']
  collaborators: Song['collaborators'] | Album['collaborators'] | Artist['collaborators']
}

export default function Details (props: Props) {
  const { session } = useOutletContext<OutletContext>()

  const Songs = props.songs?.map(s => <SongListItem song={s} key={s.id} />)
  const Albums = props.albums?.map(a => <AlbumListItem album={a} key={a.id} />)
  const Artists = props.artists?.map(a => <ArtistListItem artist={a} key={a.id} />)

  const Collaborators = props.collaborators.map(c => <Collaborator
    collaborator={c}
    of={props.of}
    id={props.id}
    role={props.role}
    currentUser={c.id === session.user.id}
    key={c.id}
  />)


  return <>
    <span className={styles.role}>{props.role}</span>
    
    { Albums && <>
      <h2 className={styles.label}>Albums</h2>
      <List className={styles.list}>
        { Albums }
        { props.of === 'artist' && <CreateListItem of="album" artistId={props.id} /> }
      </List>
    </> }

    { Songs && <>
      <h2 className={styles.label}>Songs</h2>
      <List className={styles.list}>
        { Songs }
        { props.of === 'album' && <CreateListItem of="song" albumId={props.id} /> }
        { props.of === 'artist' && <CreateListItem of="song" artistId={props.id} /> }
      </List>
    </> }

    { Artists && Artists.length > 0 && <>
      <h2 className={styles.label}>Artists</h2>
      <List className={styles.list}>{ Artists }</List>
    </> }

    <h2 className={styles.label}>Collaborators</h2>
    <List className={`${styles.list} ${styles.collaborators}`}>
      { Collaborators }
      <AddCollaborator of={props.of} id={props.id} role={props.role || "viewer"} />
      <ExternalCollaborators
        albums={props.of === 'song' ? props.albums : undefined}
        artists={props.of === 'song' || props.of === 'album' ? props.artists : undefined}
      />
    </List>
  </>
}