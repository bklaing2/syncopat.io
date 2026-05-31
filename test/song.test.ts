import { beforeEach, describe, expect, test } from "vitest"
import type { Song } from "#/types";
import BUILD_SONG from "./fixtures/song"
import * as songActions from "../src/song"

let song: Song;

beforeEach(() => song = BUILD_SONG())

test("rename", () => {
  const updatedSong = songActions.rename(song, "New Title");
  expect(updatedSong.title).toBe("New Title");
})

describe("section", () => {
  test("rename", () => {
    // Middle
    let updatedSong = songActions.renameSection(song, song.sections[2].id, "New Section Title");
    expect.soft(updatedSong.sections[2].title).toBe("New Section Title");

    // First
    updatedSong = songActions.renameSection(song, song.sections[0].id, "New Section Title");
    expect.soft(updatedSong.sections[0].title).toBe("New Section Title");

    // Last
    updatedSong = songActions.renameSection(song, song.sections[11].id, "New Section Title");
    expect.soft(updatedSong.sections[11].title).toBe("New Section Title");
  })

  test("insert - in middle", () => {
    const updatedSong = songActions.insertSection(song, {
      title: "New Section",
      lines: [],
    }, song.sections[2].id)

    expect(updatedSong.sections.length).toBe(song.sections.length + 1);
    expect(updatedSong.sections[2]).toEqual({
      id: expect.any(String),
      title: "New Section",
      lines: [],
    })
  })
  test("insert - at beginning", () => {
    const updatedSong = songActions.insertSection(song, {
      title: "New Section",
      lines: [],
    }, song.sections[0].id)

    expect(updatedSong.sections.length).toBe(song.sections.length + 1);
    expect(updatedSong.sections[0]).toEqual({
      id: expect.any(String),
      title: "New Section",
      lines: [],
    })
  })
  test("insert - at end", () => {
    const updatedSong = songActions.insertSection(song, {
      title: "New Section",
      lines: [],
    })

    expect(updatedSong.sections.length).toBe(song.sections.length + 1);
    expect(updatedSong.sections[12]).toEqual({
      id: expect.any(String),
      title: "New Section",
      lines: [],
    })
  })
  test("insert - throws error when before id is invalid", () => {
    const nonExistentId = () => songActions.insertSection(song, {
      title: "New Section",
      lines: [],
    }, "non-existent id")

    expect(nonExistentId).toThrow();
  })

  test("remove", () => {
    // Middle
    let updatedSong = songActions.removeSection(song, song.sections[2].id)
    expect.soft(updatedSong.sections.length).toBe(song.sections.length - 1);

    // First
    updatedSong = songActions.removeSection(song, song.sections[0].id)
    expect.soft(updatedSong.sections.length).toBe(song.sections.length - 1);

    // Last
    updatedSong = songActions.removeSection(song, song.sections[song.sections.length - 1].id)
    expect.soft(updatedSong.sections.length).toBe(song.sections.length - 1);
  })

  test("remove - throws error when given non-existent section", () => {
    const noSection = () => songActions.removeSection(song, "new section")

    expect.soft(noSection).toThrow();
  })

  test("remove - throws error when multiple sections have the same ID", () => {
    song.sections[0].id = "duplicate id"
    song.sections[1].id = "duplicate id"
    const manySections = () => songActions.removeSection(song, "duplicate id")

    expect(manySections).toThrow();
  })

  test.todo("reorder (consider links)")

  describe("update content (consider links)")

  test("link - set", () => {
    // Add link
    let updatedSong = songActions.setSectionLink(song, song.sections[0].id, "new link");

    expect(updatedSong.sections[0]).toHaveProperty("link", "new link");
    expect(updatedSong.sections[0]).toHaveProperty("overrides", []);
    expect(updatedSong.sections[0]).not.toHaveProperty("lines");

    expect(updatedSong.sectionLinks["new link"]).toEqual([])

    // Replace link
    updatedSong = songActions.setSectionLink(updatedSong, updatedSong.sections[0].id, "replaced link");

    expect(updatedSong.sections[0]).toHaveProperty("link", "replaced link");
    expect(updatedSong.sections[0]).toHaveProperty("overrides", []);
    expect(updatedSong.sections[0]).not.toHaveProperty("lines");

    expect(updatedSong.sectionLinks["new link"]).toBeUndefined()
    expect(updatedSong.sectionLinks["replaced link"]).toEqual([])

    // Replace link with same link
    updatedSong = songActions.setSectionLink(updatedSong, updatedSong.sections[0].id, "replaced link");

    expect(updatedSong.sections[0]).toHaveProperty("link", "replaced link");
    expect(updatedSong.sections[0]).toHaveProperty("overrides", []);
    expect(updatedSong.sections[0]).not.toHaveProperty("lines");

    expect(updatedSong.sectionLinks["replaced link"]).toEqual([])

    // Remove link
    updatedSong = songActions.setSectionLink(updatedSong, updatedSong.sections[0].id, null);

    expect(updatedSong.sections[0]).not.toHaveProperty("link");
    expect(updatedSong.sections[0]).not.toHaveProperty("overrides");
    expect(updatedSong.sections[0]).toHaveProperty("lines");

    expect(updatedSong.sectionLinks["new link"]).toBeUndefined()
    expect(updatedSong.sectionLinks["replaced link"]).toBeUndefined()
  })

  test("link - assign section to existing section link", () => {
    const updatedSong = songActions.setSectionLink(song, song.sections[6].id, "section link 1");

    expect(updatedSong.sections[6]).toHaveProperty("link", "section link 1");
    expect(updatedSong.sections[6]).toHaveProperty("overrides", []);
    expect(updatedSong.sections[6]).not.toHaveProperty("lines");
  })

  test("link - assign section with line link to existing section link", () => {
    // Test section, line, and null links
    const updatedSong = songActions.setSectionLink(song, song.sections[7].id, "section link 1");

    expect(updatedSong.sections[7]).toHaveProperty("link", "section link 1");
    expect(updatedSong.sections[7]).toHaveProperty("overrides[0]", { line: 2, with: 0 });
    expect(updatedSong.sections[7]).not.toHaveProperty("lines");
  })

  test("link - create overrides when assigning existing link to a section with conflicting content", () => {
    const updatedSong = songActions.setSectionLink(song, song.sections[8].id, "section link 1");
    expect(updatedSong.sections[8]).toHaveProperty("link", "section link 1");
    expect(updatedSong.sections[8]).toHaveProperty("overrides[0]", { line: 1, with: "conflicting line 6" });
    expect(updatedSong.sections[8]).not.toHaveProperty("lines");
  })

  test("get line", () => {
    let line = songActions.getSectionLine(song, song.sections[6].id, 2);
    expect.soft(line).toEqual("line 7");

    // With section link and no overrides"
    line = songActions.getSectionLine(song, song.sections[2].id, 2);
    expect.soft(line).toEqual("line 7");

    // With section link and overrides
    line = songActions.getSectionLine(song, song.sections[5].id, 0);
    expect.soft(line).toEqual("overridden line 5");

    line = songActions.getSectionLine(song, song.sections[5].id, 1);
    expect.soft(line).toEqual("linked line 2");

    // With line links"
    line = songActions.getSectionLine(song, song.sections[11].id, 3);
    expect.soft(line).toEqual("linked line 2");
  })

  test("get lines", () => {
    let lines = songActions.getSectionLines(song, song.sections[6].id);
    expect.soft(lines).toEqual(["line 5", "line 6", "line 7", "line 8"]);

    // With section link and no overrides"
    lines = songActions.getSectionLines(song, song.sections[2].id);
    expect.soft(lines).toEqual(["line 5", "line 6", "line 7", "line 8"]);

    // With section link and overrides
    lines = songActions.getSectionLines(song, song.sections[5].id);
    expect.soft(lines).toEqual(["overridden line 5", "linked line 2", "line 7", "line 8"]);

    // With line links"
    lines = songActions.getSectionLines(song, song.sections[11].id);
    expect.soft(lines).toEqual(["line 13", "line 14", "line 15", "linked line 2", "", "line 17", "line 18", "line 19", "linked line 2"]);
  })
})


describe("line", () => {
  test("add line")
  test("delete line")
  test.todo("reorder (consider links, and section links)")

  test("update content - section line", () => {
    const updatedSong = songActions.updateLine(song, song.sections[1].id, 1, "new content");

    expect(updatedSong.sections[1].lines[0]).toBe("line 1");
    expect(updatedSong.sections[1].lines[1]).toBe("new content");
    expect(updatedSong.sections[1].lines[2]).toBe("line 3");
    expect(updatedSong.sections[1].lines[3]).toBe("line 4");
  })
  test("update content - section link", () => {
    const updatedSong = songActions.updateLine(song, song.sections[2].id, 2, "new content");
    expect(updatedSong.sectionLinks[song.sections[2].link][2]).toBe("new content");
  })
  test("update content - section override", () => {
    let updatedSong = songActions.updateLine(song, song.sections[3].id, 3, "new content");
    expect(updatedSong.sections[3].overrides[0].with).toBe("new content");
    expect(updatedSong.sectionLinks[song.sections[3].link][3]).toBe("line 8");

    updatedSong = songActions.updateLine(song, song.sections[4].id, 3, "new content");
    expect(updatedSong.sections[4].overrides[0].with).toBe(0);
    expect(updatedSong.sectionLinks[song.sections[3].link][3]).toBe("line 8");
    expect(updatedSong.lineLinks[0]).toBe("new content");
  })
  test("update content - line link", () => {
    const updatedSong = songActions.updateLine(song, song.sections[11].id, 3, "new content");
    expect(updatedSong.sections[11].lines[3]).toBe(song.sections[11].lines[3]);
    expect(updatedSong.lineLinks[song.sections[11].lines[3]]).toBe("new content");
  })
})
