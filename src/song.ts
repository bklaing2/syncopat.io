import type { Section, Song } from "#/types";

export function rename(song: Song, newTitle: string): Song {
  return { ...song, title: newTitle }
}

// Section actions
export function insertSection(song: Song, section: Omit<Section, "id">, position?: number): Song {
  position = position ?? song.sections.length;

  if (position < 0 || position > song.sections.length)
    throw new Error("Position out of bounds");

  return {
    ...song,
    sections: [
      ...song.sections.slice(0, position),
      { ...section, id: crypto.randomUUID() },
      ...song.sections.slice(position)
    ]
  }
}

export function removeSection(song: Song, sectionId: Section["id"]): Song {
  const filteredSections = song.sections.filter(s => s.id !== sectionId);
  if (filteredSections.length < song.sections.length - 1)
    throw new Error("Unable to remove section: multiple sections with the same ID found.");

  if (filteredSections.length === song.sections.length)
    throw new Error("Unable to remove section: no section with the given ID found.");

  return {
    ...song,
    sections: filteredSections
  }
}

export function renameSection(song: Song, sectionId: Section["id"], newTitle: string): Song {
  return {
    ...song,
    sections: song.sections.map(s =>
      s.id === sectionId ? { ...s, title: newTitle } : s
    )
  }
}

export function setSectionLink(song: Song, sectionId: Section["id"], link: Section["link"]): Song {
  return {
    ...song,
    sections: song.sections.map(s =>
      s.id === sectionId ? { ...s, link: link } : s
    )
  }
}
