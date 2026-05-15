import type { Section, Song } from "#/types";
import { capitalize } from "#/util";
import type { Root } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { type Compiler, type Processor, unified } from "unified";

export async function getSong() {
  const [fileHandle] = await window.showOpenFilePicker();

  // Get raw file text
  const file = await fileHandle.getFile();
  const markdown = await file.text();

  // Parse markdown
  const song = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(function sectionify() {
      // @ts-expect-error: This is a valid assignment, but TypeScript doesn't understand it.
      const self: Processor<undefined, undefined, undefined, Root> = this;

      const song: Song = {
        fileHandle,
        frontmatter: "",
        sections: [],
      };

      let currentSection: Section | null = null;

      const compiler: Compiler<Root> = (tree) => {
        visit(tree, ["yaml", "heading", "paragraph"], (node) => {
          if (node.type === "yaml") {
            song.frontmatter = node.value;
            return;
          }

          if (node.type === "heading" && node.depth === 1) {
            if (currentSection) song.sections.push(currentSection);

            currentSection = {
              id: crypto.randomUUID(),
              type: node.children
                .filter((child) => "value" in child)
                .map((child) => child.value)
                .join("")
                .toLowerCase(),
              content: "",
            };

            return;
          }

          if (!currentSection) return;

          if (currentSection.content.length > 0)
            currentSection.content += "\n\n";
          currentSection.content +=
            "children" in node
              ? node.children
                .map((child) => ("value" in child ? child.value : ""))
                .join("\n")
              : "";
        });

        if (currentSection) song.sections.push(currentSection);

        return song;
      };
      self.compiler = compiler;
    })
    .process(markdown);

  return song.result as Song;
}

export async function saveSong(song: Song) {
  song.sections = song.sections.map((s) => {
    const textarea = document.getElementById(s.id) as HTMLTextAreaElement | null;
    return { ...s, content: textarea?.value || "" };
  });

  const markdown = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkStringify)
    .process(
      `---\n${song.frontmatter}\n---\n${song.sections
        .map((s) => `# ${capitalize(s.type)}\n\n${s.content}`)
        .join("\n\n")}`,
    );

  const writable = await song.fileHandle.createWritable();
  await writable.write(String(markdown));
  await writable.close();
}
