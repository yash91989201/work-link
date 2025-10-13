export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account: {
        Row: {
          access_token: string | null
          access_token_expires_at: string | null
          account_id: string
          created_at: string
          id: string
          id_token: string | null
          password: string | null
          provider_id: string
          refresh_token: string | null
          refresh_token_expires_at: string | null
          scope: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          access_token_expires_at?: string | null
          account_id: string
          created_at: string
          id: string
          id_token?: string | null
          password?: string | null
          provider_id: string
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          updated_at: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          access_token_expires_at?: string | null
          account_id?: string
          created_at?: string
          id?: string
          id_token?: string | null
          password?: string | null
          provider_id?: string
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      attachment: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          is_public: boolean
          message_id: string
          mime_type: string
          original_name: string
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["attachment_type"]
          updated_at: string
          uploaded_by: string
          url: string | null
        }
        Insert: {
          created_at: string
          file_name: string
          file_size: number
          id: string
          is_public?: boolean
          message_id: string
          mime_type: string
          original_name: string
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["attachment_type"]
          updated_at: string
          uploaded_by: string
          url?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          id?: string
          is_public?: boolean
          message_id?: string
          mime_type?: string
          original_name?: string
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["attachment_type"]
          updated_at?: string
          uploaded_by?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachment_message_id_message_id_fk"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "message"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachment_uploaded_by_user_id_fk"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          break_duration: number | null
          check_in_time: string | null
          check_out_time: string | null
          clock_in_method: Database["public"]["Enums"]["clock_in_method"] | null
          clock_out_method:
            | Database["public"]["Enums"]["clock_out_method"]
            | null
          coordinates: string | null
          created_at: string
          date: string
          device_info: string | null
          id: string
          ip_address: string | null
          is_approved: boolean
          is_deleted: boolean
          is_manual_entry: boolean
          location: string | null
          notes: string | null
          organization_id: string
          overtime_hours: number | null
          shift_id: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          team_id: string | null
          total_hours: number | null
          updated_at: string
          user_id: string
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          break_duration?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          clock_in_method?:
            | Database["public"]["Enums"]["clock_in_method"]
            | null
          clock_out_method?:
            | Database["public"]["Enums"]["clock_out_method"]
            | null
          coordinates?: string | null
          created_at: string
          date: string
          device_info?: string | null
          id: string
          ip_address?: string | null
          is_approved?: boolean
          is_deleted?: boolean
          is_manual_entry?: boolean
          location?: string | null
          notes?: string | null
          organization_id: string
          overtime_hours?: number | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          team_id?: string | null
          total_hours?: number | null
          updated_at: string
          user_id: string
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          break_duration?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          clock_in_method?:
            | Database["public"]["Enums"]["clock_in_method"]
            | null
          clock_out_method?:
            | Database["public"]["Enums"]["clock_out_method"]
            | null
          coordinates?: string | null
          created_at?: string
          date?: string
          device_info?: string | null
          id?: string
          ip_address?: string | null
          is_approved?: boolean
          is_deleted?: boolean
          is_manual_entry?: boolean
          location?: string | null
          notes?: string | null
          organization_id?: string
          overtime_hours?: number | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          team_id?: string | null
          total_hours?: number | null
          updated_at?: string
          user_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_approved_by_user_id_fk"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_organization_id_organization_id_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_team_id_team_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_verified_by_user_id_fk"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      channel: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_archived: boolean
          is_private: boolean
          last_message_at: string | null
          message_count: number
          name: string
          organization_id: string
          team_id: string | null
          type: Database["public"]["Enums"]["channel_type"]
          updated_at: string
        }
        Insert: {
          created_at: string
          created_by: string
          description?: string | null
          id: string
          is_archived?: boolean
          is_private?: boolean
          last_message_at?: string | null
          message_count?: number
          name: string
          organization_id: string
          team_id?: string | null
          type?: Database["public"]["Enums"]["channel_type"]
          updated_at: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_private?: boolean
          last_message_at?: string | null
          message_count?: number
          name?: string
          organization_id?: string
          team_id?: string | null
          type?: Database["public"]["Enums"]["channel_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_created_by_user_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_organization_id_organization_id_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_team_id_team_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_join_request: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          note: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["join_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at: string
          id: string
          note?: string | null
          requested_at: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["join_request_status"]
          updated_at: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          note?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["join_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_join_request_channel_id_channel_id_fk"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_join_request_reviewed_by_user_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_join_request_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_member: {
        Row: {
          channel_id: string
          id: string
          is_muted: boolean
          joined_at: string
          last_read_at: string | null
          notification_settings: Json | null
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id: string
          is_muted?: boolean
          joined_at: string
          last_read_at?: string | null
          notification_settings?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          is_muted?: boolean
          joined_at?: string
          last_read_at?: string | null
          notification_settings?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_member_channel_id_channel_id_fk"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_member_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_id: string
          organization_id: string
          role: string | null
          status: string
          team_id: string | null
        }
        Insert: {
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_id: string
          organization_id: string
          role?: string | null
          status?: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_id?: string
          organization_id?: string
          role?: string | null
          status?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_inviter_id_user_id_fk"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_organization_id_organization_id_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_team_id_team_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
        ]
      }
      member: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at: string
          id: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_organization_id_organization_id_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          channel_id: string | null
          content: string | null
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_pinned: boolean
          mentions: Json | null
          parent_message_id: string | null
          pinned_at: string | null
          pinned_by: string | null
          reactions: Json | null
          receiver_id: string | null
          sender_id: string
          thread_count: number
          type: Database["public"]["Enums"]["message_type"]
          updated_at: string
        }
        Insert: {
          channel_id?: string | null
          content?: string | null
          created_at: string
          deleted_at?: string | null
          edited_at?: string | null
          id: string
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          mentions?: Json | null
          parent_message_id?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          reactions?: Json | null
          receiver_id?: string | null
          sender_id: string
          thread_count?: number
          type?: Database["public"]["Enums"]["message_type"]
          updated_at: string
        }
        Update: {
          channel_id?: string | null
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          mentions?: Json | null
          parent_message_id?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          reactions?: Json | null
          receiver_id?: string | null
          sender_id?: string
          thread_count?: number
          type?: Database["public"]["Enums"]["message_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_channel_id_channel_id_fk"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_pinned_by_user_id_fk"
            columns: ["pinned_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_receiver_id_user_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_sender_id_user_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_message_id_message_id_fk"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "message"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          action_url: string | null
          created_at: string
          dismissed_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string | null
          metadata: Json | null
          read_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at: string
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          dismissed_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          created_at: string
          id: string
          logo: string | null
          metadata: string | null
          name: string
          slug: string | null
        }
        Insert: {
          created_at: string
          id: string
          logo?: string | null
          metadata?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo?: string | null
          metadata?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      session: {
        Row: {
          active_organization_id: string | null
          active_team_id: string | null
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active_organization_id?: string | null
          active_team_id?: string | null
          created_at: string
          expires_at: string
          id: string
          ip_address?: string | null
          token: string
          updated_at: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active_organization_id?: string | null
          active_team_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      team: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_organization_id_organization_id_fk"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member: {
        Row: {
          created_at: string
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at: string
          id: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_team_id_team_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean
          id: string
          image: string | null
          name: string
          test: boolean
          updated_at: string
        }
        Insert: {
          created_at: string
          email: string
          email_verified?: boolean
          id: string
          image?: string | null
          name: string
          test?: boolean
          updated_at: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean
          id?: string
          image?: string | null
          name?: string
          test?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          identifier: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at: string
          expires_at: string
          id: string
          identifier: string
          updated_at: string
          value: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      attachment_type:
        | "image"
        | "document"
        | "video"
        | "audio"
        | "archive"
        | "other"
      attendance_status:
        | "present"
        | "absent"
        | "late"
        | "excused"
        | "partial"
        | "holiday"
        | "sick_leave"
        | "work_from_home"
      channel_type: "team" | "group" | "direct"
      clock_in_method:
        | "manual"
        | "qr_code"
        | "geofence"
        | "ip_restriction"
        | "biometric"
        | "rfid"
      clock_out_method:
        | "manual"
        | "qr_code"
        | "geofence"
        | "ip_restriction"
        | "biometric"
        | "rfid"
        | "auto"
      join_request_status: "pending" | "approved" | "rejected"
      message_type: "text" | "file" | "image" | "video" | "reply"
      notification_status: "unread" | "read" | "dismissed"
      notification_type:
        | "message"
        | "mention"
        | "channel_invite"
        | "direct_message"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      attachment_type: [
        "image",
        "document",
        "video",
        "audio",
        "archive",
        "other",
      ],
      attendance_status: [
        "present",
        "absent",
        "late",
        "excused",
        "partial",
        "holiday",
        "sick_leave",
        "work_from_home",
      ],
      channel_type: ["team", "group", "direct"],
      clock_in_method: [
        "manual",
        "qr_code",
        "geofence",
        "ip_restriction",
        "biometric",
        "rfid",
      ],
      clock_out_method: [
        "manual",
        "qr_code",
        "geofence",
        "ip_restriction",
        "biometric",
        "rfid",
        "auto",
      ],
      join_request_status: ["pending", "approved", "rejected"],
      message_type: ["text", "file", "image", "video", "reply"],
      notification_status: ["unread", "read", "dismissed"],
      notification_type: [
        "message",
        "mention",
        "channel_invite",
        "direct_message",
      ],
    },
  },
} as const
