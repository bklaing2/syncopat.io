import type { Song } from "#/types";

const buildSong = (): Song => ({
  title: "Example Song",
  frontmatter: "",
  sections: [
    {
      id: "0", title: "Verse 1", lines: [
        { id: "0-1", content: "verse 1 line 1" },
        { id: "0-2", content: "verse 1 line 2" },
        { id: "0-3", content: "verse 1 line 3" },
        { id: "0-4", content: "verse 1 line 4" },
      ]
    },
    {
      id: "1", title: "Prechorus 1", link: "prechorus", lines: [
        { id: "1-1", content: "prechorus line 1 linked" },
        { id: "1-2", content: "prechorus line 2 linked" },
        { id: "1-3", content: "prechorus line 3 linked" },
        { id: "1-4", content: "prechorus line 4 linked" },
      ]
    },
    {
      id: "2", title: "Chorus", link: "chorus", lines: [
        { id: "2-1", content: "chorus line 1 linked" },
        { id: "2-2", content: "chorus line 2 linked" },
        { id: "2-3", content: "chorus line 3 linked" },
        { id: "2-4", content: "chorus line 4 linked" },
      ]
    },
    {
      id: "3", title: "Verse 2", lines: [
        { id: "3-1", content: "verse/chorus line linked", link: 0 },
        { id: "3-2", content: "verse 2 line 2" },
        { id: "3-3", content: "verse 2 line 3" },
        { id: "3-4", content: "verse 2 line 4" },
      ]
    },
    {
      id: "4", title: "Prechorus 2", link: "prechorus", lines: [
        { id: "4-1", content: "prechorus 2 line 1", link: null },
        { id: "4-2", content: "prechorus line 2 linked" },
        { id: "4-3", content: "prechorus line 3 linked" },
        { id: "4-4", content: "prechorus line 4 linked" },
      ]
    },
    {
      id: "5", title: "Chorus", link: "chorus", lines: [
        { id: "5-1", content: "chorus line 1 linked" },
        { id: "5-2", content: "chorus line 2 linked" },
        { id: "5-3", content: "chorus line 3 linked" },
        { id: "5-4", content: "chorus line 4 linked" },
      ]
    },
    {
      id: "6", title: "Bridge", lines: [
        { id: "6-1", content: "bridge line 1" },
        { id: "6-2", content: "bridge line 2" },
        { id: "6-3", content: "bridge line 3" },
        { id: "6-4", content: "bridge line linked", link: 1 },
        { id: "6-5", content: "" },
        { id: "6-6", content: "bridge line a" },
        { id: "6-7", content: "bridge line b" },
        { id: "6-8", content: "bridge line c" },
        { id: "6-9", content: "bridge line linked", link: 1 },
      ]
    },
    {
      id: "7", title: "Chorus", link: "chorus", lines: [
        { id: "7-1", content: "verse/chorus line linked", link: 0 },
        { id: "7-2", content: "chorus line 2 linked" },
        { id: "7-3", content: "chorus line 3 linked" },
        { id: "7-4", content: "chorus line 4", link: null },
      ]
    },
  ]
})

export default buildSong;
