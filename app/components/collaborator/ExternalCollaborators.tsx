import { Link } from "@remix-run/react";
import styles from "./styles.module.css";

interface Props { albums?: { id: number, title: string }[], artists?: { id: number, name: string }[] }

export default function ExternalCollaborators ({ albums = [], artists = [] }: Props) {

  const albumCollaborators = albums.length <= 0 ? null : <>collaborators on {albums.map((a, i) => [
    i > 0 && ", ",
    <Link to={`/albums/${a.id}`} className={styles.externalCollaborator} key={a.id}>{a.title}</Link>
  ])}</>

  const artistCollaborators = artists.length <= 0 ? null : <>members of {artists.map((a, i) => [
    i > 0 && ", ",
    <Link to={`/artists/${a.id}`} className={styles.externalCollaborator} key={a.id}>{a.name}</Link>
  ])}</>


  if (!albumCollaborators && !artistCollaborators) return null

  return <p className={styles.externalCollaborators}>
    Plus { albumCollaborators } { albumCollaborators && artistCollaborators && 'and ' } { artistCollaborators }
  </p>
}