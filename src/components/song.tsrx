import { createSongSignal, SongContext } from "#/context.tsrx";
import { saveSong } from '#/fs';
import type { Song as SongType } from '#/types';

export component Song(props: { song: SongType }) {
  const song = createSongSignal(props.song);

  <SongContext.Provider value={song}>
    <h1 class="text-2xl">{song().title}</h1>
    <button class="mb-8" onClick={() => saveSong(song())}>"Save"</button>


    <p class="flex flex-col">
      for (const section of song().sections) {
        <label class="text-xl text-gray-600 mb-2" for={section.id}>{section.title}</label>
        <button onClick={() => section.toggleLinked()}>
          if (section.link) "⛓️‍💥"
          else "🔗"
        </button>

        <textarea
          id={section.id}
          value={section.lines.map((l) => l.content).join("\n")}
          class="field-sizing-content resize-none mb-6"
          rows={4}
        />
      }
    </p>
  </SongContext.Provider>
}
