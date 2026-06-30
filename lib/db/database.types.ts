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
  cozmo: {
    Tables: {
      accounts: {
        Row: {
          blurb: string | null
          created_at: string
          domain: string | null
          enriched_json: Json | null
          featured: boolean
          fit_reason: string | null
          hq_city: string | null
          hq_state: string | null
          id: string
          mapped_page: string | null
          name: string
          rank: number | null
          segment: string
          source_url: string | null
          website: string | null
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          domain?: string | null
          enriched_json?: Json | null
          featured?: boolean
          fit_reason?: string | null
          hq_city?: string | null
          hq_state?: string | null
          id?: string
          mapped_page?: string | null
          name: string
          rank?: number | null
          segment: string
          source_url?: string | null
          website?: string | null
        }
        Update: {
          blurb?: string | null
          created_at?: string
          domain?: string | null
          enriched_json?: Json | null
          featured?: boolean
          fit_reason?: string | null
          hq_city?: string | null
          hq_state?: string | null
          id?: string
          mapped_page?: string | null
          name?: string
          rank?: number | null
          segment?: string
          source_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      activity: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          meta_json: Json | null
          summary: string | null
          type: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          meta_json?: Json | null
          summary?: string | null
          type: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          meta_json?: Json | null
          summary?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          account_id: string | null
          contact_id: string | null
          created_at: string
          demo_booked: boolean
          duration_s: number | null
          elevenlabs_conversation_id: string | null
          id: string
          outcome: string | null
          recording_url: string | null
          status: string
          to_number: string | null
          transcript: string | null
          trigger: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          contact_id?: string | null
          created_at?: string
          demo_booked?: boolean
          duration_s?: number | null
          elevenlabs_conversation_id?: string | null
          id?: string
          outcome?: string | null
          recording_url?: string | null
          status?: string
          to_number?: string | null
          transcript?: string | null
          trigger?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          contact_id?: string | null
          created_at?: string
          demo_booked?: boolean
          duration_s?: number | null
          elevenlabs_conversation_id?: string | null
          id?: string
          outcome?: string | null
          recording_url?: string | null
          status?: string
          to_number?: string | null
          transcript?: string | null
          trigger?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string
          created_at: string
          id: string
          name: string
          segment: string
          status: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          name: string
          segment: string
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          name?: string
          segment?: string
          status?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          account_id: string
          confidence: string | null
          created_at: string
          email: string | null
          id: string
          linkedin: string | null
          name: string | null
          phone: string | null
          title: string | null
        }
        Insert: {
          account_id: string
          confidence?: string | null
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string | null
          phone?: string | null
          title?: string | null
        }
        Update: {
          account_id?: string
          confidence?: string | null
          created_at?: string
          email?: string | null
          id?: string
          linkedin?: string | null
          name?: string | null
          phone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          account_id: string
          body: string | null
          campaign_id: string | null
          channel: string
          contact_id: string | null
          created_at: string
          id: string
          provider_id: string | null
          scheduled_at: string | null
          send_mode: string
          sent_at: string | null
          status: string
          step_no: number
          subject: string | null
        }
        Insert: {
          account_id: string
          body?: string | null
          campaign_id?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          id?: string
          provider_id?: string | null
          scheduled_at?: string | null
          send_mode?: string
          sent_at?: string | null
          status?: string
          step_no?: number
          subject?: string | null
        }
        Update: {
          account_id?: string
          body?: string | null
          campaign_id?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          id?: string
          provider_id?: string | null
          scheduled_at?: string | null
          send_mode?: string
          sent_at?: string | null
          status?: string
          step_no?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          body_template: string | null
          campaign_id: string
          created_at: string
          delay_days: number
          id: string
          step_no: number
          subject_template: string | null
        }
        Insert: {
          body_template?: string | null
          campaign_id: string
          created_at?: string
          delay_days?: number
          id?: string
          step_no: number
          subject_template?: string | null
        }
        Update: {
          body_template?: string | null
          campaign_id?: string
          created_at?: string
          delay_days?: number
          id?: string
          step_no?: number
          subject_template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  cozmo: {
    Enums: {},
  },
} as const
