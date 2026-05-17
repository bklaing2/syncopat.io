import type { Section, Song } from "#/types";
import type { Root } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { type Compiler, type Processor, unified } from "unified";

export const parse = (markdown: string) => unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(function sectionify() {
    // @ts-expect-error: This is a valid assignment, but TypeScript doesn't understand it.
    const self: Processor<undefined, undefined, undefined, Root> = this;

    const song = {
      frontmatter: "",
      sections: [] as Section[],
    };

    let currentSection: Section | null = null;

    const compiler: Compiler<Root> = (tree) => {
      visit(tree, ["yaml", "heading", "paragraph"], (node) => {
        if (node.type === "yaml") {
          song.frontmatter = node.value;
          return;
        }

        if (node.type === "heading" && node.depth === 1) {
          if (currentSection) song.sections.push(currentSection)

          const value = node.children
            .filter((child) => "value" in child)
            .map((child) => child.value)
            .join("")

          const { content: title, link } = parseLine(value);
          if (typeof link !== "string" && link !== undefined)
            throw new Error("Section links must be strings or undefined, received `" + typeof link + "`.");

          currentSection = {
            id: `section ${song.sections.length}`,
            title,
            lines: [],
            link
          };

          return;
        }

        if (!currentSection) return;

        // Push blank line when multiple paragraphs
        if (currentSection.lines.length > 0)
          currentSection.lines.push({
            id: `${currentSection!.id} line ${currentSection.lines.length}`,
            content: ""
          });

        // Extract lines from children nodes
        if ("children" in node)
          currentSection.lines.push(...node.children
            .flatMap((child) => {
              const lines = "value" in child ? child.value : ""
              return lines.split("\n").map((line, j) => ({
                id: `${currentSection!.id} line ${currentSection!.lines.length + j}`,
                ...parseLine(line)
              }))
            })
          );
      });

      if (currentSection) song.sections.push(currentSection);

      return song;
    };
    self.compiler = compiler;
  })
  .process(markdown)
  .then((file) => file.result as Song);


const LINK_REGEX = /^(?<content>.*?)(?:\s+%%(?:(?:🔗(?<link>[^%]+))|(?<broken>⛓️‍💥))%%)?$/

const parseLine = (input: string) => {
  const { content = input, link, broken } = input.match(LINK_REGEX)?.groups ?? {};
  return {
    content: content.trim(),
    link: !broken ? /^\d+$/.test(link) ? parseInt(link) : link?.trim() : null,
  }
}
