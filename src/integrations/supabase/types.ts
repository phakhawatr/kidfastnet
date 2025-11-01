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
      affiliate_codes: {
        Row: {
          affiliate_code: string
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_code: string
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          affiliate_code: string
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          affiliate_code?: string
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_rewards: {
        Row: {
          created_at: string
          id: string
          points: number
          referral_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          referral_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          referral_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          cost_estimate: number | null
          created_at: string | null
          feature_type: string
          id: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string | null
          feature_type: string
          id?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string | null
          feature_type?: string
          id?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      line_link_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          line_user_id: string | null
          link_code: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          line_user_id?: string | null
          link_code: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          line_user_id?: string | null
          link_code?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_link_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      line_message_logs: {
        Row: {
          created_at: string
          error_message: string | null
          exercise_type: string
          id: string
          message_data: Json | null
          sent_at: string
          success: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          exercise_type: string
          id?: string
          message_data?: Json | null
          sent_at?: string
          success?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          exercise_type?: string
          id?: string
          message_data?: Json | null
          sent_at?: string
          success?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_message_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
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
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_identifier: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_identifier?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_identifier?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          ai_features_enabled: boolean | null
          ai_monthly_quota: number | null
          created_at: string | null
          features: Json | null
          id: string
          plan_name: string
          price_6_months: number | null
          price_monthly: number | null
        }
        Insert: {
          ai_features_enabled?: boolean | null
          ai_monthly_quota?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          plan_name: string
          price_6_months?: number | null
          price_monthly?: number | null
        }
        Update: {
          ai_features_enabled?: boolean | null
          ai_monthly_quota?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          plan_name?: string
          price_6_months?: number | null
          price_monthly?: number | null
        }
        Relationships: []
      }
      user_points: {
        Row: {
          id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_registrations: {
        Row: {
          age: number
          ai_features_enabled: boolean | null
          ai_monthly_quota: number | null
          ai_quota_reset_date: string | null
          ai_usage_count: number | null
          approved_at: string | null
          approved_by: string | null
          avatar: string
          created_at: string
          device_info: string | null
          grade: string
          id: string
          is_online: boolean | null
          last_activity_at: string | null
          last_login_at: string | null
          learning_style: string | null
          line_connected_at: string | null
          line_display_name: string | null
          line_picture_url: string | null
          line_user_id: string | null
          login_count: number | null
          member_id: string | null
          nickname: string
          parent_email: string
          parent_phone: string | null
          password_hash: string
          payment_date: string | null
          payment_status: string | null
          referred_by_code: string | null
          session_id: string | null
          status: string
          subscription_tier: string | null
        }
        Insert: {
          age: number
          ai_features_enabled?: boolean | null
          ai_monthly_quota?: number | null
          ai_quota_reset_date?: string | null
          ai_usage_count?: number | null
          approved_at?: string | null
          approved_by?: string | null
          avatar: string
          created_at?: string
          device_info?: string | null
          grade: string
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          learning_style?: string | null
          line_connected_at?: string | null
          line_display_name?: string | null
          line_picture_url?: string | null
          line_user_id?: string | null
          login_count?: number | null
          member_id?: string | null
          nickname: string
          parent_email: string
          parent_phone?: string | null
          password_hash: string
          payment_date?: string | null
          payment_status?: string | null
          referred_by_code?: string | null
          session_id?: string | null
          status?: string
          subscription_tier?: string | null
        }
        Update: {
          age?: number
          ai_features_enabled?: boolean | null
          ai_monthly_quota?: number | null
          ai_quota_reset_date?: string | null
          ai_usage_count?: number | null
          approved_at?: string | null
          approved_by?: string | null
          avatar?: string
          created_at?: string
          device_info?: string | null
          grade?: string
          id?: string
          is_online?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          learning_style?: string | null
          line_connected_at?: string | null
          line_display_name?: string | null
          line_picture_url?: string | null
          line_user_id?: string | null
          login_count?: number | null
          member_id?: string | null
          nickname?: string
          parent_email?: string
          parent_phone?: string | null
          password_hash?: string
          payment_date?: string | null
          payment_status?: string | null
          referred_by_code?: string | null
          session_id?: string | null
          status?: string
          subscription_tier?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_user_registrations: {
        Args: { admin_email: string }
        Returns: {
          age: number
          ai_features_enabled: boolean
          ai_monthly_quota: number
          ai_usage_count: number
          approved_at: string
          approved_by: string
          avatar: string
          created_at: string
          grade: string
          id: string
          last_login_at: string
          learning_style: string
          login_count: number
          member_id: string
          nickname: string
          parent_email: string
          parent_phone: string
          payment_date: string
          payment_status: string
          status: string
          subscription_tier: string
        }[]
      }
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
          member_id: string
          nickname: string
          user_id: string
        }[]
      }
      check_and_reset_ai_quota: {
        Args: { p_user_id: string }
        Returns: {
          has_quota: boolean
          remaining: number
        }[]
      }
      check_line_message_quota: {
        Args: { p_user_id: string }
        Returns: {
          can_send: boolean
          messages_sent_today: number
          quota_limit: number
          remaining: number
        }[]
      }
      check_user_session_status: {
        Args: {
          new_device_info?: string
          new_session_id: string
          user_email: string
        }
        Returns: {
          can_login: boolean
          message: string
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
      downgrade_to_basic: {
        Args: { p_admin_id: string; p_registration_id: string }
        Returns: boolean
      }
      generate_affiliate_code: { Args: { p_user_id: string }; Returns: string }
      generate_member_id: { Args: never; Returns: string }
      get_affiliate_referrals: {
        Args: { p_user_email: string }
        Returns: {
          approved_at: string
          id: string
          nickname: string
          parent_email: string
          payment_date: string
          payment_status: string
          points_earned: number
          referral_status: string
          signup_date: string
          user_status: string
        }[]
      }
      get_user_affiliate_stats: {
        Args: { p_user_email: string }
        Returns: {
          affiliate_code: string
          awaiting_approval_referrals: number
          paid_referrals: number
          pending_referrals: number
          total_points: number
          total_referrals: number
        }[]
      }
      get_user_registrations: {
        Args: never
        Returns: {
          age: number
          approved_at: string
          approved_by: string
          avatar: string
          created_at: string
          grade: string
          id: string
          last_login_at: string
          learning_style: string
          login_count: number
          member_id: string
          nickname: string
          parent_email: string
          parent_phone: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ai_usage: {
        Args: {
          p_feature_type: string
          p_tokens_used?: number
          p_user_id: string
        }
        Returns: boolean
      }
      is_authenticated_admin: { Args: never; Returns: boolean }
      is_user_affiliate_owner: { Args: { p_user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: { action_data?: Json; action_type: string; admin_email: string }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_user_identifier?: string
        }
        Returns: string
      }
      logout_user_session: {
        Args: { session_id?: string; user_email: string }
        Returns: boolean
      }
      mark_payment_completed: {
        Args: { p_admin_id: string; p_registration_id: string }
        Returns: boolean
      }
      process_affiliate_reward: {
        Args: { p_referred_email: string }
        Returns: boolean
      }
      register_new_user: {
        Args: {
          p_affiliate_code?: string
          p_age: number
          p_avatar: string
          p_grade: string
          p_learning_style: string
          p_nickname: string
          p_parent_email: string
          p_parent_phone: string
          p_password: string
        }
        Returns: string
      }
      reject_user_registration: {
        Args: { admin_id: string; registration_id: string }
        Returns: boolean
      }
      reset_payment_status: {
        Args: { p_admin_id: string; p_registration_id: string }
        Returns: boolean
      }
      revoke_admin_role: {
        Args: { revoking_admin_email: string; target_admin_email: string }
        Returns: boolean
      }
      toggle_user_suspension: {
        Args: { admin_id: string; registration_id: string }
        Returns: boolean
      }
      track_referral_signup: {
        Args: { p_referred_email: string; p_referrer_member_id: string }
        Returns: undefined
      }
      update_login_stats: { Args: { user_email: string }; Returns: boolean }
      update_user_session: {
        Args: { device_info?: string; session_id: string; user_email: string }
        Returns: boolean
      }
      upgrade_to_premium: {
        Args: { p_admin_id: string; p_registration_id: string }
        Returns: boolean
      }
      validate_email_format: { Args: { email: string }; Returns: boolean }
      validate_phone_format: { Args: { phone: string }; Returns: boolean }
      verify_admin_session: { Args: { admin_email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "parent" | "user"
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
      app_role: ["admin", "parent", "user"],
    },
  },
} as const
