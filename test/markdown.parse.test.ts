import { parse } from "../src/markdown";
import { describe, expect, test } from "vitest"
import { readFileSync } from "node:fs";

const SONG_FIXTURES = (fixture: string) => readFileSync(`./test/fixtures/song.${fixture}.md`, "utf-8");

test("empty file", async () => {
  const markdown = SONG_FIXTURES("empty");

  const parsed = await parse(markdown);

  expect(parsed).toEqual({ frontmatter: "", sections: [] });
})

test("only frontmatter", async () => {
  const markdown = SONG_FIXTURES("only-frontmatter");

  const parsed = await parse(markdown);

  expect(parsed).toEqual({
    frontmatter: "title: Example Song\nalbum: Example Album",
    sections: [],
  });
})

test("one section", async () => {
  const markdown = SONG_FIXTURES("one-section");

  const parsed = await parse(markdown);

  expect(parsed).toEqual({
    frontmatter: "title: Example Song\nalbum: Example Album",
    sections: [
      {
        id: expect.any(String),
        title: "Verse",
        lines: [
          { id: expect.any(String), content: "verse 1 lyric line 1", link: null },
          { id: expect.any(String), content: "verse 1 lyric line 2", link: null },
          { id: expect.any(String), content: "verse 1 lyric line 3", link: null },
          { id: expect.any(String), content: "verse 1 lyric line 4", link: null },
        ]
      },
    ],
  });
})

test("full", async () => {
  const markdown = SONG_FIXTURES("full");

  const parsed = await parse(markdown);

  expect(parsed).toMatchSnapshot()
})

describe("section", () => {
  test("set title", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[0].title).toBe("Intro");
    expect(parsed.sections[1].title).toBe("Verse");
    expect(parsed.sections[2].title).toBe("Chorus");
    expect(parsed.sections[3].title).toBe("Verse");
    expect(parsed.sections[4].title).toBe("Chorus");
    expect(parsed.sections[5].title).toBe("Bridge");
    expect(parsed.sections[6].title).toBe("Interlude");
    expect(parsed.sections[7].title).toBe("Chorus");
    expect(parsed.sections[8].title).toBe("Chorus");
    expect(parsed.sections[9].title).toBe("Refrain");
    expect(parsed.sections[10].title).toBe("Outro");
  })

  test("no content", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[0].lines).toBe([]);
    expect(parsed.sections[6].lines).toBe([]);
    expect(parsed.sections[10].lines).toBe([]);
  })
})

describe("line", () => {
  test("no link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[1].lines).toEqual([
      { id: expect.any(String), content: "verse lyric line 1", link: null },
      { id: expect.any(String), content: "verse lyric line 2", link: null },
      { id: expect.any(String), content: "verse lyric line 3", link: null },
      { id: expect.any(String), content: "verse lyric line 4", link: null },
    ]);
  })

  test("line link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[5].lines).toEqual([
      { id: expect.any(String), content: "bridge lyric line 1", link: null },
      { id: expect.any(String), content: "bridge lyric line 2", link: null },
      { id: expect.any(String), content: "bridge linked lyric line 3", link: 0 },
      { id: expect.any(String), content: "bridge linked lyric line 4", link: 1 },
      { id: expect.any(String), content: "" },
      { id: expect.any(String), content: "bridge lyric line a", link: null },
      { id: expect.any(String), content: "bridge lyric line b", link: null },
      { id: expect.any(String), content: "bridge linked lyric line 3", link: 0 },
      { id: expect.any(String), content: "bridge linked lyric line 4", link: 1 },
    ]);

    expect(parsed.sections[9].lines).toEqual([
      { id: expect.any(String), content: "refrain lyric line 1", link: null },
      { id: expect.any(String), content: "refrain lyric line 2", link: null },
      { id: expect.any(String), content: "refrain lyric line 3", link: null },
      { id: expect.any(String), content: "bridge linked lyric line 4", link: 1 },
    ]);
  })

  test("section link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[2].lines).toEqual([
      { id: expect.any(String), content: "chorus linked lyric line 1", link: "chorus" },
      { id: expect.any(String), content: "chorus linked lyric line 2", link: "chorus" },
      { id: expect.any(String), content: "chorus linked lyric line 3", link: "chorus" },
      { id: expect.any(String), content: "chorus linked lyric line 4", link: "chorus" },
    ]);

    expect(parsed.sections[8].lines).toEqual([
      { id: expect.any(String), content: "chorus lyric line 1", link: null },
      { id: expect.any(String), content: "chorus lyric line 2", link: null },
      { id: expect.any(String), content: "chorus lyric line 3", link: null },
      { id: expect.any(String), content: "chorus linked lyric line 4", link: "chorus" },
    ]);
  })

  test("section link broken", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[7].lines).toEqual([
      { id: expect.any(String), content: "chorus linked lyric line 1", link: "chorus" },
      { id: expect.any(String), content: "chorus linked lyric line 2", link: "chorus" },
      { id: expect.any(String), content: "chorus linked lyric line 3", link: "chorus" },
      { id: expect.any(String), content: "chorus unlinked lyric line 4", link: null },
    ]);
  })
})
