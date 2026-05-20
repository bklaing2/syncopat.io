import type { Line, Section, Song } from "#/types";

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

// Line actions
function getLine(song: Song, lineId: Line["id"]): Line {
  const line = song.sections.flatMap(s => s.lines).find(l => l.id === lineId);
  if (!line) throw new Error("Line not found");
  return {
    ...line,
    link: getLineLink(song, lineId)
  };
}

function getLineLink(song: Song, lineId: Line["id"]): Line["link"] {
  const section = song.sections.find(s => s.lines.some(l => l.id === lineId));
  if (!section) throw new Error("Line not found");

  const i = section.lines.findIndex(l => l.id === lineId);
  if (i === -1) throw new Error("Line not found");

  const line = section.lines[i];
  if (typeof line.link === "number" || line.link === null) return line.link;

  const link = line.link || section.link;
  return link ? link + (i + 1) : undefined;
}

export function getAllLines(song: Song): Line[] {
  return song.sections.flatMap(s => s.lines.map(l => getLine(song, l.id)))
}


export function getLinkedLines(song: Song, link: Line["link"]): Line[] {
  return getAllLines(song).filter(l => l.link === link);
}

export function updateLineContent(song: Song, lineId: Line["id"], newContent: string): Song {
  const link = getLineLink(song, lineId);

  return {
    ...song,
    sections: song.sections.map(s => ({
      ...s,
      lines: s.lines.map(l => {
        const shouldUpdate = l.id === lineId ||
          (link !== undefined && link !== null && getLineLink(song, l.id) === link)

        return shouldUpdate ? { ...l, content: newContent } : l
      })
    }))
  }
}
