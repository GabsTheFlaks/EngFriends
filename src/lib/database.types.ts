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
      profiles: {
        Row: {
          id: string
          avatar_index: number | null
          username: string | null
        }
        Insert: {
          id: string
          avatar_index?: number | null
          username?: string | null
        }
        Update: {
          id?: string
          avatar_index?: number | null
          username?: string | null
        }
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription?: Json
          created_at?: string
        }
      }
    }
  }
}
