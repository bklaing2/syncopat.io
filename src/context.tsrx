import type { Section, Song } from "#/types";
import {
  createContext,
  createSignal,
  useContext,
} from "solid-js";

export const SongContext = createContext<ReturnType<typeof createSongSignal>>()

export function createSongSignal(initial: Song) {
  const [song, setSong] = createSignal(initial);

  return () => ({
    ...song(),
    sections: song().sections.map(section => {
      return {
        ...section,
        updateContent: (content: string) => updateSectionContent(section, content),
        toggleLinked: () => toggleSectionLinked(section)
      }
    })
  })

  function updateSectionContent(targetSection: Section, content: string) {
    setSong((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => s.id === targetSection.id ? { ...s, content } : s)
    }))
  }

  function toggleSectionLinked(targetSection: Section) {
    setSong((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => s.id === targetSection.id ? { ...s, link: !s.link } : s)
    }))
  }
}

export function useSong() {
  const context = useContext(SongContext);
  if (!context)
    throw new Error("useSong must be used within a SongContext");

  return context
}
