import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, test } from "vitest"
import type { Song } from "#/types";
import BUILD_SONG from "./fixtures/song"
import { parse } from "../src/markdown";

const SONG_FIXTURES = (fixture: string) => readFileSync(`./test/fixtures/song.${fixture}.md`, "utf-8");

let song: Song;

beforeEach(() => song = BUILD_SONG())

test("empty file", async () => {
  const markdown = SONG_FIXTURES("empty");
  const parsed = await parse(markdown);

  expect(parsed).toEqual({
    title: "",
    frontmatter: "",
    sections: [],
    sectionLinks: {},
    lineLinks: {},
  } satisfies Song);
})

test("only frontmatter", async () => {
  const markdown = SONG_FIXTURES("only-frontmatter");
  const parsed = await parse(markdown);

  expect(parsed).toEqual({
    title: "",
    frontmatter: "title: Example Song\nalbum: Example Album",
    sections: [],
    sectionLinks: {},
    lineLinks: {},
  } satisfies Song);
})

test("one section", async () => {
  const markdown = SONG_FIXTURES("one-section");
  const parsed = await parse(markdown);

  expect(parsed).toEqual({
    title: "",
    frontmatter: "title: Example Song\nalbum: Example Album",
    sections: [{
      id: "section 0",
      title: "Verse",
      lines: ["verse 1 line 1", "verse 1 line 2", "verse 1 line 3", "verse 1 line 4"],
    }],
    sectionLinks: {},
    lineLinks: {},
  } satisfies Song);
})

test("full", async () => {
  const markdown = SONG_FIXTURES("full");
  const parsed = await parse(markdown);

  expect(parsed).toEqual(song);
})

describe("section", () => {
  test("set title", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);

    expect(parsed.sections[0].title).toBe(song.sections[0].title);
    expect(parsed.sections[1].title).toBe(song.sections[1].title);
    expect(parsed.sections[2].title).toBe(song.sections[2].title);
    expect(parsed.sections[3].title).toBe(song.sections[3].title);
    expect(parsed.sections[4].title).toBe(song.sections[4].title);
    expect(parsed.sections[5].title).toBe(song.sections[5].title);
    expect(parsed.sections[6].title).toBe(song.sections[6].title);
    expect(parsed.sections[7].title).toBe(song.sections[7].title);
    expect(parsed.sections[8].title).toBe(song.sections[8].title);
    expect(parsed.sections[9].title).toBe(song.sections[9].title);
    expect(parsed.sections[10].title).toBe(song.sections[10].title);
    expect(parsed.sections[11].title).toBe(song.sections[11].title);
  })

  test("set link", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);

    expect(parsed.sections[0].link).toBe(song.sections[0].link);
    expect(parsed.sections[1].link).toBe(song.sections[1].link);
    expect(parsed.sections[2].link).toBe(song.sections[2].link);
    expect(parsed.sections[3].link).toBe(song.sections[3].link);
    expect(parsed.sections[4].link).toBe(song.sections[4].link);
    expect(parsed.sections[5].link).toBe(song.sections[5].link);
    expect(parsed.sections[6].link).toBe(song.sections[6].link);
    expect(parsed.sections[7].link).toBe(song.sections[7].link);
    expect(parsed.sections[8].link).toBe(song.sections[8].link);
    expect(parsed.sections[9].link).toBe(song.sections[9].link);
    expect(parsed.sections[10].link).toBe(song.sections[10].link);
    expect(parsed.sections[11].link).toBe(song.sections[11].link);
  })

  test("no content", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);
    expect(parsed.sections[0].lines).toEqual([]);
  })
})

describe("line", () => {
  test("no link", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);
    expect(parsed.sections[1].lines).toEqual(song.sections[1].lines);
  })

  test("line link", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);
    expect(parsed.sections[11].lines).toEqual(song.sections[11].lines);
  })

  test("section link", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);

    expect(parsed.sections[2].link).toEqual(song.sections[2].link);
    expect(parsed.sections[3].link).toEqual(song.sections[3].link);
    expect(parsed.sections[4].link).toEqual(song.sections[4].link);
    expect(parsed.sections[5].link).toEqual(song.sections[5].link);

    expect(parsed.sectionLinks[parsed.sections[2].link]).toEqual(song.sectionLinks[song.sections[2].link]);
  })

  test("section link overridden", async () => {
    const markdown = SONG_FIXTURES("full");
    const parsed = await parse(markdown);

    expect(parsed.sections[3].overrides).toEqual(song.sections[3].overrides);
    expect(parsed.sections[4].overrides).toEqual(song.sections[4].overrides);
    expect(parsed.sections[5].overrides).toEqual(song.sections[5].overrides);
  })
})

describe.todo("edge cases", () => {
  test.todo("invalid section link")
  test.todo("invalid line link")
})
