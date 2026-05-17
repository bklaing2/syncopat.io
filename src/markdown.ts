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

          currentSection = {
            id: song.sections.length.toString(),
            title: getContent(value),
            lines: [],
            link: getLink(value)
          };

          return;
        }

        if (!currentSection) return;

        // Push blank line when multiple paragraphs
        if (currentSection.lines.length > 0)
          currentSection.lines.push({ id: crypto.randomUUID(), content: "", link: null });

        // Extract lines from children nodes
        if ("children" in node)
          currentSection.lines.push(...node.children
            .flatMap((child) => {
              const lines = "value" in child ? child.value : ""
              return lines.split("\n").map((line) => ({
                id: crypto.randomUUID(),
                content: line,
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


const LINK_REGEX = /^(?<title>.*?)(?:\s+%%🔗(?<link>.*?)%%)?$/;

const getContent = (input: string) =>
  input.match(LINK_REGEX)?.groups?.title ?? ""

const getLink = (input: string) =>
  input.match(LINK_REGEX)?.groups?.link
