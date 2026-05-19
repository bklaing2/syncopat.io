import type { Song } from "#/types";
import BUILD_SONG from "./fixtures/song"
import { beforeEach, describe, expect, test } from "vitest"
import * as songActions from "../src/song"

let song: Song;

beforeEach(() => song = BUILD_SONG())

test("rename", () => {
  const updatedSong = songActions.rename(song, "New Title");

  expect(updatedSong.title).toBe("New Title");
})

describe("section", () => {
  describe("rename", () => {
    test("middle", () => {
      const updatedSong = songActions.renameSection(song, "2", "New Section Title");

      expect(updatedSong.sections[0].title).toBe("Verse 1");
      expect(updatedSong.sections[1].title).toBe("Prechorus 1");
      expect(updatedSong.sections[2].title).toBe("New Section Title");
      expect(updatedSong.sections[3].title).toBe("Verse 2");
      expect(updatedSong.sections[4].title).toBe("Prechorus 2");
      expect(updatedSong.sections[5].title).toBe("Chorus");
      expect(updatedSong.sections[6].title).toBe("Bridge");
      expect(updatedSong.sections[7].title).toBe("Chorus");
    })

    test("first", () => {
      const updatedSong = songActions.renameSection(song, "0", "New Section Title");

      expect(updatedSong.sections[0].title).toBe("New Section Title");
      expect(updatedSong.sections[1].title).toBe("Prechorus 1");
      expect(updatedSong.sections[2].title).toBe("Chorus");
      expect(updatedSong.sections[3].title).toBe("Verse 2");
      expect(updatedSong.sections[4].title).toBe("Prechorus 2");
      expect(updatedSong.sections[5].title).toBe("Chorus");
      expect(updatedSong.sections[6].title).toBe("Bridge");
      expect(updatedSong.sections[7].title).toBe("Chorus");
    })

    test("last", () => {
      const updatedSong = songActions.renameSection(song, "7", "New Section Title");

      expect(updatedSong.sections[0].title).toBe("Verse 1");
      expect(updatedSong.sections[1].title).toBe("Prechorus 1");
      expect(updatedSong.sections[2].title).toBe("Chorus");
      expect(updatedSong.sections[3].title).toBe("Verse 2");
      expect(updatedSong.sections[4].title).toBe("Prechorus 2");
      expect(updatedSong.sections[5].title).toBe("Chorus");
      expect(updatedSong.sections[6].title).toBe("Bridge");
      expect(updatedSong.sections[7].title).toBe("New Section Title");
    })
  })

  describe("insert", () => {
    test("in middle", () => {
      const updatedSong = songActions.insertSection(song, {
        title: "New Section",
        lines: [],
      }, 2)

      expect(updatedSong.sections.length).toBe(9);
      expect(updatedSong.sections[2]).toEqual({
        id: expect.any(String),
        title: "New Section",
        lines: [],
      })
      expect(updatedSong.sections[0].id).toBe("0");
      expect(updatedSong.sections[1].id).toBe("1");
      expect(updatedSong.sections[2].id).toEqual(expect.any(String));
      expect(updatedSong.sections[3].id).toBe("2");
      expect(updatedSong.sections[4].id).toBe("3");
      expect(updatedSong.sections[5].id).toBe("4");
      expect(updatedSong.sections[6].id).toBe("5");
      expect(updatedSong.sections[7].id).toBe("6");
      expect(updatedSong.sections[8].id).toBe("7");
    })
    test("at beginning", () => {
      const updatedSong = songActions.insertSection(song, {
        title: "New Section",
        lines: [],
      }, 0)

      expect(updatedSong.sections.length).toBe(9);
      expect(updatedSong.sections[0]).toEqual({
        id: expect.any(String),
        title: "New Section",
        lines: [],
      })
      expect(updatedSong.sections[0].id).toEqual(expect.any(String));
      expect(updatedSong.sections[1].id).toBe("0");
      expect(updatedSong.sections[2].id).toBe("1");
      expect(updatedSong.sections[3].id).toBe("2");
      expect(updatedSong.sections[4].id).toBe("3");
      expect(updatedSong.sections[5].id).toBe("4");
      expect(updatedSong.sections[6].id).toBe("5");
      expect(updatedSong.sections[7].id).toBe("6");
      expect(updatedSong.sections[8].id).toBe("7");
    })
    test("at end", () => {
      const updatedSong = songActions.insertSection(song, {
        title: "New Section",
        lines: [],
      }, 8)

      expect(updatedSong.sections.length).toBe(9);
      expect(updatedSong.sections[8]).toEqual({
        id: expect.any(String),
        title: "New Section",
        lines: [],
      })
      expect(updatedSong.sections[0].id).toBe("0");
      expect(updatedSong.sections[1].id).toBe("1");
      expect(updatedSong.sections[2].id).toBe("2");
      expect(updatedSong.sections[3].id).toBe("3");
      expect(updatedSong.sections[4].id).toBe("4");
      expect(updatedSong.sections[5].id).toBe("5");
      expect(updatedSong.sections[6].id).toBe("6");
      expect(updatedSong.sections[7].id).toBe("7");
      expect(updatedSong.sections[8].id).toEqual(expect.any(String));
    })
    test("without setting position appends to end", () => {
      const updatedSong = songActions.insertSection(song, {
        title: "New Section",
        lines: [],
      })

      expect(updatedSong.sections.length).toBe(9);
      expect(updatedSong.sections[8]).toEqual({
        id: expect.any(String),
        title: "New Section",
        lines: [],
      })
      expect(updatedSong.sections[0].id).toBe("0");
      expect(updatedSong.sections[1].id).toBe("1");
      expect(updatedSong.sections[2].id).toBe("2");
      expect(updatedSong.sections[3].id).toBe("3");
      expect(updatedSong.sections[4].id).toBe("4");
      expect(updatedSong.sections[5].id).toBe("5");
      expect(updatedSong.sections[6].id).toBe("6");
      expect(updatedSong.sections[7].id).toBe("7");
      expect(updatedSong.sections[8].id).toEqual(expect.any(String));
    })
    test("throws error when position is invalid", () => {
      const negativePosition = () => songActions.insertSection(song, {
        title: "New Section",
        lines: [],
      }, -1)

      const outOfBoundsPosition = () => songActions.insertSection(song, {
        title: "New Section",
        lines: [],
      }, 9)

      expect(negativePosition).toThrow();
      expect(outOfBoundsPosition).toThrow();
    })
  })

  describe("remove", () => {
    test("in middle", () => {
      const updatedSong = songActions.removeSection(song, song.sections[2].id)

      expect(updatedSong.sections.length).toBe(7);
      expect(updatedSong.sections[0].id).toBe("0");
      expect(updatedSong.sections[1].id).toBe("1");
      expect(updatedSong.sections[2].id).toBe("3");
      expect(updatedSong.sections[3].id).toBe("4");
      expect(updatedSong.sections[4].id).toBe("5");
      expect(updatedSong.sections[5].id).toBe("6");
      expect(updatedSong.sections[6].id).toBe("7");
    })

    test("first", () => {
      const updatedSong = songActions.removeSection(song, song.sections[0].id)

      expect(updatedSong.sections.length).toBe(7);
      expect(updatedSong.sections[0].id).toBe("1");
      expect(updatedSong.sections[1].id).toBe("2");
      expect(updatedSong.sections[2].id).toBe("3");
      expect(updatedSong.sections[3].id).toBe("4");
      expect(updatedSong.sections[4].id).toBe("5");
      expect(updatedSong.sections[5].id).toBe("6");
      expect(updatedSong.sections[6].id).toBe("7");
    })

    test("last", () => {
      const updatedSong = songActions.removeSection(song, song.sections[7].id)

      expect(updatedSong.sections.length).toBe(7);
      expect(updatedSong.sections[0].id).toBe("0");
      expect(updatedSong.sections[1].id).toBe("1");
      expect(updatedSong.sections[2].id).toBe("2");
      expect(updatedSong.sections[3].id).toBe("3");
      expect(updatedSong.sections[4].id).toBe("4");
      expect(updatedSong.sections[5].id).toBe("5");
      expect(updatedSong.sections[6].id).toBe("6");
    })

    test("throws error when given non-existent section", () => {
      const noSection = () => songActions.removeSection(song, "new section")

      expect(noSection).toThrow();
    })

    test("throws error when multiple sections have the same ID", () => {
      song.sections[0].id = "duplicate id"
      song.sections[1].id = "duplicate id"
      const manySections = () => songActions.removeSection(song, "duplicate id")

      expect(manySections).toThrow();
    })
  })

  test.todo("reorder (consider links)")

  describe("update content (consider links)")

  test("set link", () => {
    // Add link
    let updatedSong = songActions.setSectionLink(song, song.sections[0].id, "verse");

    expect(updatedSong.sections[0].link).toBe("verse");

    // Replace link
    updatedSong = songActions.setSectionLink(song, song.sections[0].id, "chorus");

    expect(updatedSong.sections[0].link).toBe("chorus");

    // Remove link
    updatedSong = songActions.setSectionLink(song, song.sections[0].id, undefined);

    expect(updatedSong.sections[0].link).toBeUndefined();
  })
})



describe("line", () => {
  test("add line")
  test("delete line")
  test.todo("reorder (consider links, and section links)")

  test("update content (consider links)")
  test("update link")

})


