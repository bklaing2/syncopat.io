import { parse } from "#/markdown";
import type { Song } from "#/types";

export async function getSong() {
  const [fileHandle] = await window.showOpenFilePicker();

  // Get raw file text
  const file = await fileHandle.getFile();
  const markdown = await file.text();

  // Parse markdown
  const song = await parse(markdown)

  return { ...song, title: fileHandle.name.slice(0, -3) };
}

export async function saveSong(song: Song) {
  //   song.sections = song.sections.map((s) => {
  //     const textarea = document.getElementById(s.id) as HTMLTextAreaElement | null;
  //     return { ...s, content: textarea?.value || "" };
  //   });
  //
  //   const markdown = await unified()
  //     .use(remarkParse)
  //     .use(remarkFrontmatter)
  //     .use(remarkStringify)
  //     .process(
  //       `---\n${song.frontmatter}\n---\n${song.sections
  //         .map((s) => `# ${capitalize(s.type)}\n\n${s.content}`)
  //         .join("\n\n")}`,
  //     );
  //
  //   const writable = await song.fileHandle.createWritable();
  //   await writable.write(String(markdown));
  //   await writable.close();
}
