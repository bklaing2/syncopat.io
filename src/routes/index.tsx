import { Song } from '#/components/song.tsrx';
import { getSong } from '#/fs'
import type { Song as SongType } from '#/types';
import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js';

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [song, setSong] = createSignal<SongType | null>(null);

  return (
    <>
      <button onClick={() => getSong().then(setSong)}>Select song</button>

      <Show when={song()}>{(song) => <Song song={song()} setSong={setSong} />}</Show>
    </>
  )
}
