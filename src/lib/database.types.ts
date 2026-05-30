export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface PushSubscriptionPayload {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_index: number | null
          ra: string | null
          course: string | null
          period: string | null
          pinned_chats: string[] | null
          muted_chats: string[] | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_index?: number | null
          ra?: string | null
          course?: string | null
          period?: string | null
          pinned_chats?: string[] | null
          muted_chats?: string[] | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_index?: number | null
          ra?: string | null
          course?: string | null
          period?: string | null
          pinned_chats?: string[] | null
          muted_chats?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rooms: {
        Row: {
          id: string
          name: string
          type: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          type: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          room_id: string | null
          sender_id: string | null
          content: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id?: string | null
          sender_id?: string | null
          content: string
          type?: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string | null
          sender_id?: string | null
          content?: string
          type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: number
          sender: string
          text: string
          is_me: boolean
          time: string | null
          chat_id: number
          created_at: string | null
        }
        Insert: {
          id?: number
          sender: string
          text: string
          is_me: boolean
          time?: string | null
          chat_id: number
          created_at?: string | null
        }
        Update: {
          id?: number
          sender?: string
          text?: string
          is_me?: boolean
          time?: string | null
          chat_id?: number
          created_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: number
          title: string
          team: string | null
          desc: string | null
          progress: number
          image_placeholder_color: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          title: string
          team?: string | null
          desc?: string | null
          progress?: number
          image_placeholder_color?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          team?: string | null
          desc?: string | null
          progress?: number
          image_placeholder_color?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          subscription: PushSubscriptionPayload
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          subscription: PushSubscriptionPayload
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          subscription?: PushSubscriptionPayload
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      room_participants: {
        Row: {
          room_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          room_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          room_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_dm: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: { id: string }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
