import { useFetcher, Link } from "@remix-run/react";
import { useState, type KeyboardEvent } from "react";

import styles from "./section.module.css";
import type { Song } from "~/types"

import Textarea from "~/components/realtime/Textarea";


interface Props {
  id: number
  section: Song['sections'][number]
  index: number
  canEdit: boolean
  onArrowKey: (e: KeyboardEvent<HTMLTextAreaElement>, dir: 'up' | 'down' | 'left' | 'right') => void
  // collapsed: boolean
}


export default function Section ({ id, section, index, canEdit, onArrowKey /* collapsed = false */ }: Props) {
  const [ focused, setFocused ] = useState(false)
  const [ collapsed, setCollapsed ] = useState(false)


  function handleKeydown (e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'ArrowUp') onArrowKey(e, 'up')
    if (e.key === 'ArrowDown') onArrowKey(e, 'down')
    if (e.key === 'ArrowLeft') onArrowKey(e, 'left')
    if (e.key === 'ArrowRight') onArrowKey(e, 'right')
  }

  
  return <li className={styles.section} data-focused={focused} data-collapsed={collapsed}>
    { canEdit && index === 0 && <AddSection id={id} position={0} top /> }

    <input
      className="hide"
      type="checkbox"
      name="collapsed"
      onClick={() => setCollapsed(!collapsed)}
      defaultChecked={collapsed}
    />
    <label className={styles.collapse} htmlFor="collapsed" onClick={() => setCollapsed(!collapsed)} />

    { canEdit && <Link to={`/songs/${id}/sections/${index}`} className={styles.settings}>⚙&#xFE0E;</Link> }

    <h3 className={styles.label}>
      { section?.type }
      { section?.linked && canEdit && <span className={styles.linked}>⛓&#xFE0E;</span> }
    </h3>

    <Textarea
      name="content"
      placeholder="Add lyrics..."
      value={section?.content}
      action={`/songs/${id}/sections/${index}`}
      collapsed={collapsed}
      disabled={!canEdit}
      onKeydown={handleKeydown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={styles.content}
    />

    { canEdit && <AddSection id={id} position={index + 1} /> }
  </li>
}



interface AddSectionProps { id: number; position?: number; top?: boolean; className?: string; }

export function AddSection ({ id, position, top = false, className }: AddSectionProps) {
  const fetcher = useFetcher();
  const classNames = styles.addSection + (top ? ' ' + styles.first + ' ' : ' ') + className
  
  return <fetcher.Form
    className="ignore"
    action={`/songs/${id}/sections/${position}`}
    method="post"
  >
    <input name="type" value="Verse" type="hidden" />
    <input name="content" value="" type="hidden" />
    <button className={classNames} type="submit">+ add section</button>
  </fetcher.Form>
}