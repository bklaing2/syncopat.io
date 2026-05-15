import { Song } from '#/components/song.tsrx';
import { getSong } from '#/fs'
import type { Song as SongType } from '#/types';
import { createFileRoute } from '@tanstack/solid-router'
import { createSignal } from 'solid-js';

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [song, setSong] = createSignal<SongType | null>(null);

  return (
    <div>
      <button onClick={() => getSong().then(setSong)}>Select song</button>

      <Song song={song()} />
    </div>
  )
}
