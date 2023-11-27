import { useFetcher } from "@remix-run/react";

import styles from "./styles.module.css";

import type { Song, Album, Artist } from "~/types";
import Role from "./Role";
import { splitEmail } from "~/util/email";


type Collaborators = Song['collaborators'] | Album['collaborators'] | Artist['collaborators']
type RoleType = Song['role'] | Album['role'] | Artist['role']

interface Props {
  collaborator: Collaborators[number];
  role: RoleType
  of: 'song' | 'album' | 'artist';
  id: number;
  currentUser?: boolean
}


export default function Collaborator ({ collaborator, of: type, id, role, currentUser = false }: Props) {
  const fetcher = useFetcher();

  const email = splitEmail(collaborator.email)
  const action = `/${type}s/${id}/collaborators/${collaborator.id}`

  const roleDisabled = currentUser ? true :
    role === 'owner' ? false :
    role === 'editor' && collaborator.role !== 'owner' ? false :
    true

  return <li className={styles.collaborator}>
    <span className={styles.emailUser}>{email[0]}<span className={styles.emailUrl}>{email[1]}</span></span>

    <fetcher.Form
      action={action}
      method="patch"
      onChange={e => fetcher.submit(e.currentTarget, { action: action, method: 'patch' })}
    >
      <Role value={collaborator.role} role={role} disabled={roleDisabled} />
    </fetcher.Form>

    { role !== 'owner' || currentUser ? <div></div> :
      <fetcher.Form action={action} method="delete">
        <button type="submit">🗑</button>
      </fetcher.Form>
    }
  </li>
}