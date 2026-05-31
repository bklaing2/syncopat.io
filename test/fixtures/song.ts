import type { Song } from "#/types";

const buildSong = (): Song => ({
  title: "",
  frontmatter: "title: Example Song\nalbum: Example Album",
  sections: [
    { id: "section 0", title: "empty section", lines: [] },
    { id: "section 1", title: "no links", lines: ["line 1", "line 2", "line 3", "line 4"] },

    { id: "section 2", title: "linked section", link: "section link 1", overrides: [] },
    {
      id: "section 3", title: "linked section (with line override)", link: "section link 1", overrides: [
        { line: 3, with: "overridden line 8" }]
    },
    {
      id: "section 4", title: "linked section (with link override)", link: "section link 1", overrides: [
        { line: 3, with: 0 }]
    },
    {
      id: "section 5", title: "linked section (with overrides)", link: "section link 1", overrides: [
        { line: 0, with: "overridden line 5" },
        { line: 1, with: 1 }
      ]
    },

    { id: "section 6", title: "to be linked section", lines: ["line 5", "line 6", "line 7", "line 8"] },
    { id: "section 7", title: "to be linked section (with linked line)", lines: ["line 5", "line 6", 0, "line 8"] },
    { id: "section 8", title: "to be linked section (with conflict)", lines: ["line 5", "conflicting line 6", "line 7", "line 8"] },

    { id: "section 9", title: "linked section 2", link: "section link 2", overrides: [] },
    { id: "section 10", title: "linked section 2", link: "section link 2", overrides: [] },

    {
      id: "section 11", title: "section with same line linked twice", lines: [
        "line 13", "line 14", "line 15", 1, "",
        "line 17", "line 18", "line 19", 1,
      ]
    }
  ],

  sectionLinks: {
    ["section link 1"]: ["line 5", "line 6", "line 7", "line 8"],
    ["section link 2"]: ["line 9", "line 10", "line 11", "line 12"],
  },

  lineLinks: {
    0: "linked line 1",
    1: "linked line 2",
  },
})

export default buildSong;
