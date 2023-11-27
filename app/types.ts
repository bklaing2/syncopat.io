import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Song } from "./routes/songs.$id/route";
import type { Album } from "./routes/albums.$id/route";
import type { Artist } from "./routes/artists.$id/route";
import type { Role } from "./components/collaborator/types";

type OutletContext = {
  supabase: SupabaseClient;
  session: Session;
  song: Song;
};


type Loaded<loader extends (...args: any) => any> = Awaited<ReturnType<Awaited<ReturnType<loader>>['json']>>

export {
  type OutletContext,
  type Loaded,

  type Song,
  type Album,
  type Artist,

  type Role
}