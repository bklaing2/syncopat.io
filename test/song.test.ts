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

    expect.soft(updatedSong.sections[0].link).toBe("verse");

    // Replace link
    updatedSong = songActions.setSectionLink(song, song.sections[0].id, "chorus");

    expect.soft(updatedSong.sections[0].link).toBe("chorus");

    // Remove link
    updatedSong = songActions.setSectionLink(song, song.sections[0].id, undefined);

    expect.soft(updatedSong.sections[0].link).toBeUndefined();
  })
})



describe("line", () => {
  test("add line")
  test("delete line")
  test.todo("reorder (consider links, and section links)")

  describe("update content", () => {
    test("when no link set", () => {
      const updatedSong = songActions.updateLineContent(song, song.sections[1].lines[1].id, "new content");

      expect(updatedSong.sections[1].lines[0].content).toBe("prechorus line 1 linked");
      expect(updatedSong.sections[1].lines[1].content).toBe("new content");
      expect(updatedSong.sections[1].lines[2].content).toBe("prechorus line 3 linked");
      expect(updatedSong.sections[1].lines[3].content).toBe("prechorus line 4 linked");
    })
    test("when only line link set", () => {
      let updatedSong = songActions.updateLineContent(song, song.sections[6].lines[3].id, "new content");

      expect(updatedSong.sections[6].lines[0].content).toBe("bridge line 1");
      expect(updatedSong.sections[6].lines[1].content).toBe("bridge line 2");
      expect(updatedSong.sections[6].lines[2].content).toBe("bridge line 3");
      expect(updatedSong.sections[6].lines[3].content).toBe("new content");
      expect(updatedSong.sections[6].lines[4].content).toBe("");
      expect(updatedSong.sections[6].lines[5].content).toBe("bridge line a");
      expect(updatedSong.sections[6].lines[6].content).toBe("bridge line b");
      expect(updatedSong.sections[6].lines[7].content).toBe("bridge line c");
      expect(updatedSong.sections[6].lines[8].content).toBe("new content");

      updatedSong = songActions.updateLineContent(song, song.sections[6].lines[8].id, "new content (inverse)");

      expect(updatedSong.sections[6].lines[0].content).toBe("bridge line 1");
      expect(updatedSong.sections[6].lines[1].content).toBe("bridge line 2");
      expect(updatedSong.sections[6].lines[2].content).toBe("bridge line 3");
      expect(updatedSong.sections[6].lines[3].content).toBe("new content (inverse)");
      expect(updatedSong.sections[6].lines[4].content).toBe("");
      expect(updatedSong.sections[6].lines[5].content).toBe("bridge line a");
      expect(updatedSong.sections[6].lines[6].content).toBe("bridge line b");
      expect(updatedSong.sections[6].lines[7].content).toBe("bridge line c");
      expect(updatedSong.sections[6].lines[8].content).toBe("new content (inverse)");

      updatedSong = songActions.updateLineContent(song, song.sections[7].lines[0].id, "new content");

      expect(updatedSong.sections[3].lines[0].content).toBe("new content");
      expect(updatedSong.sections[3].lines[1].content).toBe("verse 2 line 2");
      expect(updatedSong.sections[3].lines[2].content).toBe("verse 2 line 3");
      expect(updatedSong.sections[3].lines[3].content).toBe("verse 2 line 4");

      expect(updatedSong.sections[7].lines[0].content).toBe("new content");
      expect(updatedSong.sections[7].lines[1].content).toBe("chorus line 2");
      expect(updatedSong.sections[7].lines[2].content).toBe("chorus line 3");
      expect(updatedSong.sections[7].lines[3].content).toBe("chorus line 4 linked");
    })
    test("when only section link set", () => {
      let updatedSong = songActions.updateLineContent(song, song.sections[2].lines[0].id, "new content");

      expect(updatedSong.sections[2].lines[0].content).toBe("new content");
      expect(updatedSong.sections[2].lines[1].content).toBe("chorus line 2 linked");
      expect(updatedSong.sections[2].lines[2].content).toBe("chorus line 3 linked");
      expect(updatedSong.sections[2].lines[3].content).toBe("chorus line 4 linked");

      expect(updatedSong.sections[5].lines[0].content).toBe("new content");
      expect(updatedSong.sections[5].lines[1].content).toBe("chorus line 2 linked");
      expect(updatedSong.sections[5].lines[2].content).toBe("chorus line 3 linked");
      expect(updatedSong.sections[5].lines[3].content).toBe("chorus line 4 linked");

      expect(updatedSong.sections[7].lines[0].content).toBe("verse/chorus line linked");
      expect(updatedSong.sections[7].lines[1].content).toBe("chorus line 2");
      expect(updatedSong.sections[7].lines[2].content).toBe("chorus line 3");
      expect(updatedSong.sections[7].lines[3].content).toBe("chorus line 4 linked");


      updatedSong = songActions.updateLineContent(song, song.sections[2].lines[3].id, "new content");

      expect(updatedSong.sections[2].lines[0].content).toBe("chorus line 1 linked");
      expect(updatedSong.sections[2].lines[1].content).toBe("chorus line 2 linked");
      expect(updatedSong.sections[2].lines[2].content).toBe("chorus line 3 linked");
      expect(updatedSong.sections[2].lines[3].content).toBe("new content");

      expect(updatedSong.sections[5].lines[0].content).toBe("chorus line 1 linked");
      expect(updatedSong.sections[5].lines[1].content).toBe("chorus line 2 linked");
      expect(updatedSong.sections[5].lines[2].content).toBe("chorus line 3 linked");
      expect(updatedSong.sections[5].lines[3].content).toBe("new content");

      expect(updatedSong.sections[7].lines[0].content).toBe("verse/chorus line linked");
      expect(updatedSong.sections[7].lines[1].content).toBe("chorus line 2");
      expect(updatedSong.sections[7].lines[2].content).toBe("chorus line 3");
      expect(updatedSong.sections[7].lines[3].content).toBe("new content");
    })
    test("when section link set and line link set")
  })

  test("update link")

  test("get all lines", () => {
    expect(songActions.getAllLines(song)).toMatchSnapshot()
  })

  test("get linked lines", () => {
    expect.soft(songActions.getLinkedLines(song, undefined)).toMatchSnapshot();
    expect.soft(songActions.getLinkedLines(song, null)).toMatchInlineSnapshot(`
      [
        {
          "content": "prechorus 2 line 1",
          "id": "4-1",
          "link": null,
        },
      ]
    `);
    expect.soft(songActions.getLinkedLines(song, "chorus1")).toMatchInlineSnapshot(`
      [
        {
          "content": "chorus line 1 linked",
          "id": "2-1",
          "link": "chorus1",
        },
        {
          "content": "chorus line 1 linked",
          "id": "5-1",
          "link": "chorus1",
        },
      ]
    `)
    expect.soft(songActions.getLinkedLines(song, "chorus4")).toMatchInlineSnapshot(`
      [
        {
          "content": "chorus line 4 linked",
          "id": "2-4",
          "link": "chorus4",
        },
        {
          "content": "chorus line 4 linked",
          "id": "5-4",
          "link": "chorus4",
        },
        {
          "content": "chorus line 4 linked",
          "id": "7-4",
          "link": "chorus4",
        },
      ]
    `);
    expect.soft(songActions.getLinkedLines(song, 0)).toMatchInlineSnapshot(`
      [
        {
          "content": "verse/chorus line linked",
          "id": "3-1",
          "link": 0,
        },
        {
          "content": "verse/chorus line linked",
          "id": "7-1",
          "link": 0,
        },
      ]
    `);
    expect.soft(songActions.getLinkedLines(song, 1)).toMatchInlineSnapshot(`
      [
        {
          "content": "bridge line linked",
          "id": "6-4",
          "link": 1,
        },
        {
          "content": "bridge line linked",
          "id": "6-9",
          "link": 1,
        },
      ]
    `);
  })
})


