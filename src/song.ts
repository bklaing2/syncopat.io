import type { DistributiveOmit, Section, SectionLinkId, Song } from "#/types";

export function rename(song: Song, newTitle: string): Song {
  return { ...song, title: newTitle }
}

// Section actions
function getSection(song: Song, sectionId: Section["id"]): Section {
  const section = song.sections.find(s => s.id === sectionId);
  if (!section) throw new Error("Section not found");
  return section;
}

export function insertSection(song: Song, section: DistributiveOmit<Section, "id">, before?: Section["id"]): Song {
  const beforeIndex = song.sections.findIndex(s => s.id === before);
  if (before !== undefined && beforeIndex === -1)
    throw new Error("Unable to insert section: no section with the given 'before' ID found.");

  const position = beforeIndex !== -1 ? beforeIndex : song.sections.length;

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

function setSection(song: Song, sectionId: Section["id"], newSection: DistributiveOmit<Section, "id">): Song {
  const updatedSection = { ...newSection, id: sectionId };
  return {
    ...song,
    sections: song.sections.map(s => s.id === sectionId ? updatedSection : s)
  }
}

export function setSectionLink(song: Song, sectionId: Section["id"], link: SectionLinkId | null): Song {
  const section = song.sections.find(s => s.id === sectionId);
  if (!section) throw new Error("Section not found");

  const sectionLink = "link" in section ? section.link : null;

  // Return song unchanged if the section link wouldn't change
  if (sectionLink !== null && sectionLink === link) return song
  if (sectionLink === null && link === null) return song

  // Grab section lines directly or through existing link
  const _sectionLines = "lines" in section ? section.lines : song.sectionLinks[section.link];
  if (!_sectionLines) throw new Error("Linked section content not found");
  const sectionLines = [..._sectionLines]; // create a copy to avoid mutating original content

  const linkLines = link !== null && link in song.sectionLinks ? song.sectionLinks[link] : [];

  // Update section
  const overrides = []

  for (let i = 0; i < sectionLines.length; i++) {
    const sectionLine = sectionLines[i];
    const linkLine = i < linkLines.length ? linkLines[i] : undefined;

    if (typeof sectionLine || sectionLine !== linkLine)
      overrides.push({ line: i, with: sectionLines[i] })
  }

  const updatedSection = link === null
    ? { title: section.title, lines: sectionLines }
    : { title: section.title, link, overrides }

  let updatedSong = setSection(song, sectionId, updatedSection);

  // Add new section link if necessary
  const shouldCreateLink = link !== null && !(link in song.sectionLinks);
  updatedSong = {
    ...updatedSong,
    sectionLinks: {
      ...song.sectionLinks,
      ...(shouldCreateLink && { [link]: sectionLines.map((line) => typeof line === "string" ? line : "") })
    }
  }

  // If the section had no link before it is safe to return without checking for orphaned links
  if (!sectionLink) return updatedSong;

  // Check for orphaned links
  const linkOrphaned = !updatedSong.sections.some(s => "link" in s && s.link === sectionLink);
  if (!linkOrphaned) return updatedSong;

  const { [sectionLink]: _, ...sectionLinks } = updatedSong.sectionLinks;
  return {
    ...updatedSong,
    sectionLinks
  }
}

export function getSectionLine(song: Song, sectionId: Section["id"], lineIndex: number): string {
  const section = getSection(song, sectionId);

  const sectionLine = "lines" in section ? section.lines[lineIndex] : undefined;
  const overrideLine = "overrides" in section ? section.overrides.find(o => o.line === lineIndex)?.with : undefined;
  const sectionLinkLine = "link" in section && song.sectionLinks[section.link] ? song.sectionLinks[section.link][lineIndex] : undefined;

  const line = sectionLine ?? overrideLine ?? sectionLinkLine;
  if (line === undefined) throw new Error(`Line content not found for ${sectionId} at line ${lineIndex}`);

  if (typeof line === "number") {
    if (!(line in song.lineLinks)) throw new Error("Linked line content not found");
    return song.lineLinks[line];
  }

  return line;
}

export function getSectionLines(song: Song, sectionId: Section["id"]): string[] {
  const section = getSection(song, sectionId);

  if ("lines" in section)
    return section.lines.map((_, i) => getSectionLine(song, sectionId, i));

  const sectionLinkLines = song.sectionLinks[section.link];
  if (!sectionLinkLines) throw new Error("Linked section content not found");

  return sectionLinkLines.map((_, i) => getSectionLine(song, sectionId, i));
}

// Line actions
export function updateLine(song: Song, sectionId: Section["id"], lineIndex: number, content: string): Song {
  const section = getSection(song, sectionId);

  // Handle when section is not linked
  if ("lines" in section) {
    const line = section.lines[lineIndex];

    // If line is a link, update the line link content
    if (typeof line === "number") return {
      ...song,
      lineLinks: { ...song.lineLinks, [line]: content }
    }

    // Update line in section directly
    return setSection(song, sectionId, {
      ...section,
      lines: section.lines.map((l, i) => i === lineIndex ? content : l)
    })
  }

  // Handle when line overrides section link
  const override = section.overrides.find(o => o.line === lineIndex);

  // If there is no override, update the section link content
  if (!override) {
    const sectionLink = song.sectionLinks[section.link];
    if (!sectionLink) throw new Error("Linked section content not found");

    return {
      ...song,
      sectionLinks: {
        ...song.sectionLinks,
        [section.link]: sectionLink.map((l, i) => i === lineIndex ? content : l)
      }
    }
  }

  // If line is a link, update the line link content
  if (typeof override.with === "number") return {
    ...song,
    lineLinks: { ...song.lineLinks, [override.with]: content }
  }

  return setSection(song, sectionId, {
    ...section,
    overrides: section.overrides.map(o => o.line === lineIndex ? { ...o, with: content } : o)
  })
}
