import { getSong } from '#/fs'
import type { Song } from '#/types';
import { createFileRoute } from '@tanstack/solid-router'
import { createSignal } from 'solid-js';

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [song, setSong] = createSignal<Song | null>(null);

  return (
    <div>
      <button onClick={() => getSong().then(setSong)}>Select song</button>
    </div>
  )
}
