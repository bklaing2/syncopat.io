export type Section = {
  id: string;
  title: string;
  lines: { id: string, content: string, link?: string | number | null }[];
  link?: string;
};

export type Song = {
  title: string;
  frontmatter: string;
  sections: Section[];
};

// Register the result type.
declare module "unified" {
  interface CompileResultMap {
    Song: Song;
  }
}
