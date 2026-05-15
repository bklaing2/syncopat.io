import type { Song as SongType } from '#/types';

export component Song(props: { song: SongType | null }) {
  if (!props.song) return;

  <h1 class="text-2xl mb-8">{props.song.fileHandle.name.split(".")[0]}</h1>

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
