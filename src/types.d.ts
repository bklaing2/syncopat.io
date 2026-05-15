export type Section = {
  id: string;
  type: string;
  content: string;
};

export type Song = {
  fileHandle: FileSystemFileHandle;
  frontmatter: string;
  sections: Section[];
};

// Register the result type.
declare module "unified" {
  interface CompileResultMap {
    Song: Song;
  }
}
