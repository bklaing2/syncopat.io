import { saveSong } from '#/fs';
import type { Song as SongType } from '#/types';

export component Song(props: { song: SongType | null }) {
  if (!props.song) return;

  <h1 class="text-2xl">{props.song.fileHandle.name.split(".")[0]}</h1>
  <button class="mb-8" onClick={() => saveSong(props.song)}>"Save"</button>


  <p class="flex flex-col">
    for (const section of props.song.sections) {
      <label class="text-xl text-gray-600 mb-2" for={section.id}>{section.type}</label>
      <textarea
        id={section.id}
        value={section.content}
        class="field-sizing-content resize-none mb-6"
        rows={4}
      />
    }
  </p>
}
