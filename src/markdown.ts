import type { Section, Song } from "#/types";
import type { Root } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { type Compiler, type Processor, unified } from "unified";

const UNKNOWN = "???" as const;

export const parse = (markdown: string) => unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(function sectionify() {
    // @ts-expect-error: This is a valid assignment, but TypeScript doesn't understand it.
    const self: Processor<undefined, undefined, undefined, Root> = this;

    const song: Song = {
      title: "",
      frontmatter: "",
      sections: [] as Section[],
      sectionLinks: {},
      lineLinks: {},
    }

    let currentSection: Section | null = null;
    let currentSectionLink: Song["sectionLinks"][number] = []

    const compiler: Compiler<Root> = (tree) => {
      visit(tree, ["yaml", "heading", "paragraph"], (node) => {
        if (node.type === "yaml") {
          song.frontmatter = node.value;
          return;
        }

        if (node.type === "heading" && node.depth === 1) {
          if (currentSection) {
            song.sections.push(currentSection)

            if ("link" in currentSection) {
              // If the section link exists, check for conflicts and fill in unknown lines
              if (currentSection.link in song.sectionLinks) {
                const sectionLinkToAdd = []

                for (let i = 0; i < currentSectionLink.length; i++) {
                  const currentSectionLinkLine = currentSectionLink[i], songSectionLinkLine = song.sectionLinks[currentSection.link][i];

                  if (currentSectionLinkLine === UNKNOWN) {
                    sectionLinkToAdd.push(songSectionLinkLine);
                    continue;
                  }
                  if (songSectionLinkLine === UNKNOWN) {
                    sectionLinkToAdd.push(currentSectionLinkLine);
                    continue;
                  }

                  if (currentSectionLinkLine !== songSectionLinkLine) {
                    throw new Error(`Duplicate section link "${currentSection.link}" with conflicting content.`)
                  }

                  sectionLinkToAdd.push(songSectionLinkLine);
                }

                song.sectionLinks[currentSection.link] = [...sectionLinkToAdd];
              } else
                song.sectionLinks[currentSection.link] = currentSectionLink;

            }
          }

          const value = node.children
            .filter((child) => "value" in child)
            .map((child) => child.value)
            .join("")

          const { content: title, link } = parseLine(value);
          if (typeof link !== "string" && link !== undefined)
            throw new Error("Section links must be strings or undefined, received `" + typeof link + "`.");

          if (!link) currentSection = {
            id: `section ${song.sections.length}`,
            title,
            lines: [],
          }
          else currentSection = {
            id: `section ${song.sections.length}`,
            title,
            link,
            overrides: [],
          }

          currentSectionLink = [];

          return;
        }

        if (!currentSection) return;

        if ("children" in node) {
          // Extract lines from children nodes
          const linesToAdd = node.children
            .flatMap((child) => {
              const lines = "value" in child ? child.value : ""
              return lines.split("\n").map((line) => parseLine(line))
            })

          if ("lines" in currentSection) {
            // Push blank line when multiple paragraphs
            if (currentSection.lines.length > 0)
              currentSection.lines.push("");

            currentSection.lines.push(...linesToAdd.map(({ content, link }) => link ?? content));

            // Todo: Check line links
          }

          if ("link" in currentSection) {
            // Push blank line when multiple paragraphs
            if (currentSectionLink.length > 0)
              currentSectionLink.push("");

            for (let i = 0; i < linesToAdd.length; i++) {
              const { content, link } = linesToAdd[i];

              if (link !== undefined || link === null) {
                currentSection.overrides.push({ line: i, with: link ?? content })
                currentSectionLink.push(UNKNOWN);

                // Populate line link
                if (typeof link === "number") {
                  if (link in song.lineLinks && song.lineLinks[link] !== content)
                    throw new Error(`Duplicate line link "${link}" with conflicting content.`)

                  song.lineLinks[link] = content;
                }

                continue
              }

              currentSectionLink.push(content);
            }

          }
        }
      });

      if (currentSection) song.sections.push(currentSection);

      return song;
    };
    self.compiler = compiler;
  })
  .process(markdown)
  .then((file) => file.result as Song);


const LINK_REGEX = /^(?<content>.*?)(?:\s+%%\s+(?:(?:🔗\s+(?<link>.+?)\s+%%)|(?<broken>⛓️‍💥)\s+%%))?$/;

const parseLine = (input: string) => {
  const { content = input, link, broken } = input.match(LINK_REGEX)?.groups ?? {};
  return {
    content: content.trim(),
    link: !broken ? /^\d+$/.test(link) ? parseInt(link) : link?.trim() : null,
  }
}
