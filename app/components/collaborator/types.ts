export type Collaborator = { id: string; email: string; role: Role; }
export type Role = "owner" | "editor" | "viewer"