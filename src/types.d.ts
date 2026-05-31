export type Song = {
  title: string;
  frontmatter: string;
  sections: Section[];
  sectionLinks: { [sectionLinkId: SectionLinkId]: (string | LineLinkId)[] };
  lineLinks: Record<LineLinkId, string>;
};

export type Section = {
  id: string;
  title: string;
  lines: (string | LineLinkId)[]
} | {
  id: string;
  title: string;
  link: SectionLinkId;
  overrides: { line: number; with: string | LineLinkId }[]
};

export type SectionLinkId = string;
export type LineLinkId = number;

// Register the result type.
declare module "unified" {
  interface CompileResultMap {
    Song: Song;
  }
}

// Helpers
export type DistributiveOmit<T, K extends keyof any> = T extends unknown
  ? Omit<T, K>
  : never;
