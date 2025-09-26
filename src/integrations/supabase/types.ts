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
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          avatar: string
          created_at: string
          grade: string
          id: string
          is_approved: boolean
          learning_style: string | null
          nickname: string
          parent_email: string
          parent_phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          avatar?: string
          created_at?: string
          grade: string
          id?: string
          is_approved?: boolean
          learning_style?: string | null
          nickname: string
          parent_email: string
          parent_phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          avatar?: string
          created_at?: string
          grade?: string
          id?: string
          is_approved?: boolean
          learning_style?: string | null
          nickname?: string
          parent_email?: string
          parent_phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_registrations: {
        Row: {
          age: number
          approved_at: string | null
          approved_by: string | null
          avatar: string
          created_at: string
          grade: string
          id: string
          last_login_at: string | null
          learning_style: string | null
          login_count: number | null
          nickname: string
          parent_email: string
          parent_phone: string | null
          password_hash: string
          status: string
        }
        Insert: {
          age: number
          approved_at?: string | null
          approved_by?: string | null
          avatar: string
          created_at?: string
          grade: string
          id?: string
          last_login_at?: string | null
          learning_style?: string | null
          login_count?: number | null
          nickname: string
          parent_email: string
          parent_phone?: string | null
          password_hash: string
          status?: string
        }
        Update: {
          age?: number
          approved_at?: string | null
          approved_by?: string | null
          avatar?: string
          created_at?: string
          grade?: string
          id?: string
          last_login_at?: string | null
          learning_style?: string | null
          login_count?: number | null
          nickname?: string
          parent_email?: string
          parent_phone?: string | null
          password_hash?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_registrations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user_registration: {
        Args: { admin_id: string; registration_id: string }
        Returns: boolean
      }
      authenticate_admin: {
        Args: { admin_email: string; admin_password: string }
        Returns: {
          admin_id: string
          email: string
          is_valid: boolean
          name: string
        }[]
      }
      authenticate_user: {
        Args: { user_email: string; user_password: string }
        Returns: {
          email: string
          is_valid: boolean
          nickname: string
          user_id: string
        }[]
      }
      create_auth_user_from_registration: {
        Args: { admin_id: string; registration_id: string }
        Returns: {
          auth_user_id: string
          error_message: string
          success: boolean
        }[]
      }
      delete_user_registration: {
        Args: { admin_id: string; registration_id: string }
        Returns: boolean
      }
      get_user_registrations: {
        Args: Record<PropertyKey, never>
        Returns: {
          age: number
          approved_at: string
          approved_by: string
          avatar: string
          created_at: string
          grade: string
          id: string
          learning_style: string
          nickname: string
          parent_email: string
          parent_phone: string
          status: string
        }[]
      }
      is_authenticated_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reject_user_registration: {
        Args: { admin_id: string; registration_id: string }
        Returns: boolean
      }
      toggle_user_suspension: {
        Args: { admin_id: string; registration_id: string }
        Returns: boolean
      }
      update_login_stats: {
        Args: { user_email: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
