export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      album_songs: {
        Row: {
          album_id: number
          song_id: number
        }
        Insert: {
          album_id: number
          song_id: number
        }
        Update: {
          album_id?: number
          song_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_songs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      albums: {
        Row: {
          created_at: string
          id: number
          owner_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: number
          owner_id?: string | null
          title?: string
        }
        Update: {
          created_at?: string
          id?: number
          owner_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      artist_albums: {
        Row: {
          album_id: number
          artist_id: number
        }
        Insert: {
          album_id: number
          artist_id: number
        }
        Update: {
          album_id?: number
          artist_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "artist_albums_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          }
        ]
      }
      artist_songs: {
        Row: {
          artist_id: number
          song_id: number
        }
        Insert: {
          artist_id: number
          song_id: number
        }
        Update: {
          artist_id?: number
          song_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "artist_songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      artists: {
        Row: {
          created_at: string
          id: number
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      collaborators: {
        Row: {
          album_id: number | null
          artist_id: number | null
          id: number
          role: Database["public"]["Enums"]["role"]
          song_id: number | null
          user_id: string
        }
        Insert: {
          album_id?: number | null
          artist_id?: number | null
          id?: number
          role?: Database["public"]["Enums"]["role"]
          song_id?: number | null
          user_id: string
        }
        Update: {
          album_id?: number | null
          artist_id?: number | null
          id?: number
          role?: Database["public"]["Enums"]["role"]
          song_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_info"
            referencedColumns: ["id"]
          }
        ]
      }
      songs: {
        Row: {
          created_at: string
          id: number
          modified_at: string
          owner_id: string | null
          sections: Json[]
          title: string
        }
        Insert: {
          created_at?: string
          id?: number
          modified_at?: string
          owner_id?: string | null
          sections?: Json[]
          title?: string
        }
        Update: {
          created_at?: string
          id?: number
          modified_at?: string
          owner_id?: string | null
          sections?: Json[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_info: {
        Row: {
          email: string
          id: string
        }
        Insert: {
          email?: string
          id?: string
        }
        Update: {
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      collaborator_add: {
        Args: {
          email: string
          role: Database["public"]["Enums"]["role"]
          of: Database["public"]["Enums"]["category"]
          id: number
        }
        Returns: boolean
      }
      song_section_add: {
        Args: {
          section: Json
          index: number
          song_id: number
        }
        Returns: undefined
      }
      song_section_edit: {
        Args: {
          section: Json
          index: number
          song_id: number
        }
        Returns: undefined
      }
      song_section_get: {
        Args: {
          index: number
          song_id: number
        }
        Returns: Json
      }
      song_section_move: {
        Args: {
          source_index: number
          destination_index: number
          song_id: number
        }
        Returns: undefined
      }
      song_section_remove: {
        Args: {
          index: number
          song_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      category: "song" | "album" | "artist"
      role: "owner" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
