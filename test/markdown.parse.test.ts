import { parse } from "../src/markdown";
import { describe, expect, test } from "vitest"
import { readFileSync } from "node:fs";

const SONG_FIXTURES = (fixture: string) => readFileSync(`./test/fixtures/song.${fixture}.md`, "utf-8");

test("empty file", async () => {
  const markdown = SONG_FIXTURES("empty");

  const parsed = await parse(markdown);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "frontmatter": "",
      "sections": [],
      "title": "",
    }
  `);
})

test("only frontmatter", async () => {
  const markdown = SONG_FIXTURES("only-frontmatter");

  const parsed = await parse(markdown);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "frontmatter": "title: Example Song
    album: Example Album",
      "sections": [],
      "title": "",
    }
  `);
})

test("one section", async () => {
  const markdown = SONG_FIXTURES("one-section");

  const parsed = await parse(markdown);

  expect(parsed).toMatchInlineSnapshot(`
    {
      "frontmatter": "title: Example Song
    album: Example Album",
      "sections": [
        {
          "id": "section 0",
          "lines": [
            {
              "content": "verse 1 line 1",
              "id": "section 0 line 0",
              "link": undefined,
            },
            {
              "content": "verse 1 line 2",
              "id": "section 0 line 1",
              "link": undefined,
            },
            {
              "content": "verse 1 line 3",
              "id": "section 0 line 2",
              "link": undefined,
            },
            {
              "content": "verse 1 line 4",
              "id": "section 0 line 3",
              "link": undefined,
            },
          ],
          "link": undefined,
          "title": "Verse",
        },
      ],
      "title": "",
    }
  `);
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
    expect(parsed.sections[10].title).toBe("Chorus");
    expect(parsed.sections[11].title).toBe("Outro");
  })

  test("set link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[0].link).toBeUndefined();
    expect(parsed.sections[1].link).toBeUndefined();
    expect(parsed.sections[2].link).toBe("chorus");
    expect(parsed.sections[3].link).toBeUndefined();
    expect(parsed.sections[4].link).toBe("chorus");
    expect(parsed.sections[5].link).toBeUndefined();
    expect(parsed.sections[6].link).toBeUndefined();
    expect(parsed.sections[7].link).toBe("chorus");
    expect(parsed.sections[8].link).toBeUndefined();
    expect(parsed.sections[9].link).toBeUndefined();
    expect(parsed.sections[10].link).toBe("chorus");
    expect(parsed.sections[11].link).toBeUndefined();
  })

  test("no content", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[0].lines).toEqual([]);
    expect(parsed.sections[6].lines).toEqual([]);
    expect(parsed.sections[11].lines).toEqual([]);
  })
})

describe("line", () => {
  test("no link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[1].lines).toEqual([
      { id: expect.any(String), content: "verse 1 line 1" },
      { id: expect.any(String), content: "verse 1 line 2" },
      { id: expect.any(String), content: "verse 1 line 3" },
      { id: expect.any(String), content: "verse 1 line 4" },
    ]);
  })

  test("line link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[5].lines).toEqual([
      { id: expect.any(String), content: "bridge line 1" },
      { id: expect.any(String), content: "bridge line 2" },
      { id: expect.any(String), content: "bridge line 3 linked", link: 0 },
      { id: expect.any(String), content: "bridge line 4 linked", link: 1 },
      { id: expect.any(String), content: "" },
      { id: expect.any(String), content: "bridge line a" },
      { id: expect.any(String), content: "bridge line b" },
      { id: expect.any(String), content: "bridge line 3 linked", link: 0 },
      { id: expect.any(String), content: "bridge line 4 linked", link: 1 },
    ]);

    expect(parsed.sections[9].lines).toEqual([
      { id: expect.any(String), content: "refrain line 1" },
      { id: expect.any(String), content: "refrain line 2" },
      { id: expect.any(String), content: "refrain line 3" },
      { id: expect.any(String), content: "bridge line 4 linked", link: 1 },
    ]);
  })

  test("section link", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[2].lines).toEqual([
      { id: expect.any(String), content: "chorus line 1 linked" },
      { id: expect.any(String), content: "chorus line 2 linked" },
      { id: expect.any(String), content: "chorus line 3 linked" },
      { id: expect.any(String), content: "chorus line 4 linked" },
    ]);

    expect(parsed.sections[8].lines).toEqual([
      { id: expect.any(String), content: "chorus line 1" },
      { id: expect.any(String), content: "chorus line 2" },
      { id: expect.any(String), content: "chorus line 3" },
      { id: expect.any(String), content: "chorus line 4 linked", link: "chorus" },
    ]);
  })

  test("section link broken", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[7].lines).toEqual([
      { id: expect.any(String), content: "chorus line 1 linked" },
      { id: expect.any(String), content: "chorus line 2 linked" },
      { id: expect.any(String), content: "chorus line 3 linked" },
      { id: expect.any(String), content: "chorus line 4 unlinked", link: null },
    ]);
  })

  test("line link in linked section", async () => {
    const markdown = SONG_FIXTURES("full");

    const parsed = await parse(markdown);

    expect(parsed.sections[10].link).toBe("chorus");
    expect(parsed.sections[10].lines).toEqual([
      { id: expect.any(String), content: "chorus line 1 linked" },
      { id: expect.any(String), content: "chorus line 2 linked" },
      { id: expect.any(String), content: "chorus line 3 linked" },
      { id: expect.any(String), content: "bridge line 4 linked", link: 1 },
    ]);
  })
})

describe.todo("edge cases", () => {
  test.todo("invalid section link")
  test.todo("invalid line link")
})
