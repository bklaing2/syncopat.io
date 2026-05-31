import { saveSong } from '#/fs';
import { getSectionLine, getSectionLines, setSectionLink, updateLine } from "#/song";
import type { SectionLinkId, Song as SongType } from '#/types';
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

    const sectionId = lineElement.id.split("|")[0]
    const lineIndex = parseInt(lineElement.id.split("|")[1])
    setSong(updateLine(song, sectionId, lineIndex, lineContent))

    // Restore cursor position
    const range = document.createRange();
    range.setStart(anchor, lineOffset);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  }

  <div contenteditable onInput={handleLineUpdate} class="grid grid-cols-[min-content_1fr_max-content] auto-rows-auto">
    <h1 contenteditable={false} class="col-span-2 text-2xl">{song.title}</h1>
    <button contenteditable={false} class="mb-8" onClick={() => saveSong(song)}>"Save"</button>

    const sectionIds = createMemo(() => song.sections.map(s => s.id))

    for (const sectionId of sectionIds()) {
      const section = () => song.sections.find(s => s.id === sectionId)
      if (!section()) throw new Error("Section not found")

      const title = createMemo(() => section()!.title)
      const link = createMemo(() => section()!.link)
      const lineIndices = createMemo(() => getSectionLines(song, sectionId).map((_, i) => i))

      const toggleSectionLink = () => {
        let newLink: SectionLinkId | null = link() ? null : section()!.title.toLowerCase().replace(/\s+/g, "-")

        try {
          setSong(setSectionLink(song, sectionId, newLink))
        } catch (e) {
          alert(e instanceof Error ? e.message : "Unable to link section")
        }
      }

      <button onClick={toggleSectionLink} contenteditable={false} title={link()}>
        if (link()) "⛓️‍💥"
        else "🔗"
      </button>
      <h2 contenteditable={false} class="col-span-2 text-xl text-gray-600">{title()}</h2>

      for (const i of lineIndices()) {
        const line = createMemo(() => getSectionLine(song, sectionId, i))
        <span id={sectionId + "|" + i} class="col-start-2 col-span-full h-6" onKeyDown={(e) => console.log(e.target)}>
          {line()}
        </span>
      }
    }
  </div>
}
