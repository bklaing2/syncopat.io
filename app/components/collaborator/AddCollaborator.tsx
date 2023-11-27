import { useFetcher } from "@remix-run/react";
import Role from "./Role";
import styles from "./styles.module.css";
import type { Role as RoleType } from "./types";


interface AddCollaboratorProps { of: 'song' | 'album' | 'artist'; id: number; role: RoleType; }

export default function AddCollaborator ({ of: type, id, role }: AddCollaboratorProps) {
  const fetcher = useFetcher();

  if (role === 'viewer') return

  return <li className={styles.collaborator}>
    <fetcher.Form
      className="form"
      action={`/${type}s/${id}/collaborators`}
      method="post"
    >
      <input name="email" type="email" placeholder="Add collaborator email..."/>
      <Role role={role} />
      <button type="submit">+</button>
    </fetcher.Form>
  </li>
}