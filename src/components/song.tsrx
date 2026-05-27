import { saveSong } from '#/fs';
import { updateLineContent } from "#/song";
import type { Song as SongType } from '#/types';
import { createMemo, type Setter } from "solid-js";

export component Song(props: { song: SongType, setSong: Setter<SongType | null> }) {
  const &{ song, setSong } = props

  function handleLineUpdate() {
    const selection = document.getSelection();
    const anchor = selection?.anchorNode
    if (!selection || !anchor) throw new Error("No selection found")

    // Update line content
    const lineElement = anchor.parentElement as HTMLSpanElement
    const lineContent = anchor.textContent
    const lineOffset = selection.anchorOffset
    if (!lineContent || !lineElement) throw new Error("No line found")

    setSong(updateLineContent(song, lineElement.id, lineContent))

    // Restore cursor position
    const range = document.createRange();
    range.setStart(anchor, lineOffset);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  <div contenteditable onInput={handleLineUpdate} class="grid grid-cols-[1fr_max-content] auto-rows-auto">
    <h1 contenteditable={false} class="text-2xl">{song.title}</h1>
    <button contenteditable={false} class="mb-8" onClick={() => saveSong(song)}>"Save"</button>

    const sectionIds = createMemo(() => song.sections.map(s => s.id))

    for (const sectionId of sectionIds()) {
      const section = () => song.sections.find(s => s.id === sectionId)
      if (!section()) throw new Error("Section not found")

      const title = createMemo(() => section().title)
      const link = createMemo(() => section().link)
      const lineIds = createMemo(
        () => section().lines.map(l => l.id),
        undefined,
        { equals: (a, b) => a.join(",") === b.join(",") }
      )

      <h2 contenteditable={false} class="text-xl text-gray-600">{title()}</h2>
      <button contenteditable={false}>
        if (link()) "⛓️‍💥"
        else "🔗"
      </button>

      for (const lineId of lineIds()) {
        const line = createMemo(() => song.sections.flatMap(s => s.lines).find(l => l.id === lineId))
        if (!line()) throw new Error("Line not found")

        <span id={lineId} class="col-span-full h-6" onKeyDown={(e) => console.log(e.target)}>
          {line().content}
        </span>
      }
    }
  </div>
}
