import { useOutletContext } from "@remix-run/react";

import styles from "./styles.module.css";
import type { OutletContext } from "~/types";
import Modal from "~/components/modal/Modal";
import Details from "~/components/details/Details";



export default function Settings () {
  const { song } = useOutletContext<OutletContext>();

  const canEdit = song.role === 'owner' || song.role === 'editor'
  const isOwner = song.role === 'owner'


  return (
    <Modal
      titleProps={{
        name: "title",
        placeholder: "Song Title",
        value: song.title,
        action: `/songs/${song.id}`,
        disabled: !canEdit
      }}
      subtitle="song settings"
      deleteAction={isOwner ? `/songs/${song.id}` : undefined}
      className={styles.layout}
    >
      <Details
        of="song"
        id={song.id}
        role={song.role || 'viewer'}
        albums={song.albums}
        artists={song.artists}
        collaborators={song.collaborators}
      />
    </Modal>
  )
}