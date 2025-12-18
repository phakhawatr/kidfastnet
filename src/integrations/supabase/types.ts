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
      achievements: {
        Row: {
          code: string
          color: string
          created_at: string
          criteria: Json
          description_en: string
          description_th: string
          icon: string
          id: string
          name_en: string
          name_th: string
        }
        Insert: {
          code: string
          color: string
          created_at?: string
          criteria: Json
          description_en: string
          description_th: string
          icon: string
          id?: string
          name_en: string
          name_th: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string
          criteria?: Json
          description_en?: string
          description_th?: string
          icon?: string
          id?: string
          name_en?: string
          name_th?: string
        }
        Relationships: []
      }
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
      ai_recommendations: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          priority: number
          reasoning: string
          recommendation_type: string
          skill_name: string
          suggested_difficulty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          reasoning: string
          recommendation_type: string
          skill_name: string
          suggested_difficulty: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          priority?: number
          reasoning?: string
          recommendation_type?: string
          skill_name?: string
          suggested_difficulty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
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
      class_assignments: {
        Row: {
          assignment_type: string
          class_id: string
          created_at: string
          description: string | null
          due_date: string | null
          exam_link_id: string | null
          grade: number | null
          id: string
          is_active: boolean | null
          max_score: number | null
          skill_name: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignment_type?: string
          class_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          exam_link_id?: string | null
          grade?: number | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          skill_name?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          exam_link_id?: string | null
          grade?: number | null
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          skill_name?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_assignments_exam_link_id_fkey"
            columns: ["exam_link_id"]
            isOneToOne: false
            referencedRelation: "exam_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean | null
          student_id: string
          student_number: number | null
        }
        Insert: {
          class_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean | null
          student_id: string
          student_number?: number | null
        }
        Update: {
          class_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean | null
          student_id?: string
          student_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: number
          created_at: string
          grade: number
          id: string
          is_active: boolean | null
          max_students: number | null
          name: string
          school_id: string
          semester: number | null
          settings: Json | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year: number
          created_at?: string
          grade: number
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          name: string
          school_id: string
          semester?: number | null
          settings?: Json | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: number
          created_at?: string
          grade?: number
          id?: string
          is_active?: boolean | null
          max_students?: number | null
          name?: string
          school_id?: string
          semester?: number | null
          settings?: Json | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_topics: {
        Row: {
          created_at: string | null
          grade: number
          id: string
          order_index: number | null
          semester: number | null
          skill_category: string
          subject: string
          topic_name_en: string
          topic_name_th: string
        }
        Insert: {
          created_at?: string | null
          grade: number
          id?: string
          order_index?: number | null
          semester?: number | null
          skill_category: string
          subject?: string
          topic_name_en: string
          topic_name_th: string
        }
        Update: {
          created_at?: string | null
          grade?: number
          id?: string
          order_index?: number | null
          semester?: number | null
          skill_category?: string
          subject?: string
          topic_name_en?: string
          topic_name_th?: string
        }
        Relationships: []
      }
      daily_missions: {
        Row: {
          ai_reasoning: string | null
          can_retry: boolean | null
          completed_at: string | null
          completed_questions: number | null
          correct_answers: number | null
          created_at: string | null
          daily_message: string | null
          difficulty: string
          id: string
          mission_date: string
          mission_option: number | null
          question_attempts: Json | null
          skill_name: string
          stars_earned: number | null
          status: string
          time_spent: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          can_retry?: boolean | null
          completed_at?: string | null
          completed_questions?: number | null
          correct_answers?: number | null
          created_at?: string | null
          daily_message?: string | null
          difficulty: string
          id?: string
          mission_date: string
          mission_option?: number | null
          question_attempts?: Json | null
          skill_name: string
          stars_earned?: number | null
          status?: string
          time_spent?: number | null
          total_questions?: number
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          can_retry?: boolean | null
          completed_at?: string | null
          completed_questions?: number | null
          correct_answers?: number | null
          created_at?: string | null
          daily_message?: string | null
          difficulty?: string
          id?: string
          mission_date?: string
          mission_option?: number | null
          question_attempts?: Json | null
          skill_name?: string
          stars_earned?: number | null
          status?: string
          time_spent?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_links: {
        Row: {
          activity_name: string | null
          allow_retake: boolean | null
          assessment_type: string
          created_at: string
          current_students: number
          exam_passcode: string | null
          expires_at: string | null
          grade: number
          has_custom_questions: boolean | null
          id: string
          link_code: string
          max_students: number
          questions_finalized_at: string | null
          school_logo_url: string | null
          school_name: string | null
          semester: number | null
          start_time: string | null
          status: string
          teacher_id: string
          teacher_name: string | null
          time_limit_minutes: number | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          activity_name?: string | null
          allow_retake?: boolean | null
          assessment_type?: string
          created_at?: string
          current_students?: number
          exam_passcode?: string | null
          expires_at?: string | null
          grade: number
          has_custom_questions?: boolean | null
          id?: string
          link_code: string
          max_students?: number
          questions_finalized_at?: string | null
          school_logo_url?: string | null
          school_name?: string | null
          semester?: number | null
          start_time?: string | null
          status?: string
          teacher_id: string
          teacher_name?: string | null
          time_limit_minutes?: number | null
          total_questions?: number
          updated_at?: string
        }
        Update: {
          activity_name?: string | null
          allow_retake?: boolean | null
          assessment_type?: string
          created_at?: string
          current_students?: number
          exam_passcode?: string | null
          expires_at?: string | null
          grade?: number
          has_custom_questions?: boolean | null
          id?: string
          link_code?: string
          max_students?: number
          questions_finalized_at?: string | null
          school_logo_url?: string | null
          school_name?: string | null
          semester?: number | null
          start_time?: string | null
          status?: string
          teacher_id?: string
          teacher_name?: string | null
          time_limit_minutes?: number | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_links_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          choices: Json
          correct_answer: string
          created_at: string | null
          difficulty: string
          exam_link_id: string
          explanation: string | null
          id: string
          image_urls: string[] | null
          is_edited: boolean | null
          is_from_bank: boolean | null
          original_question: Json | null
          question_bank_id: string | null
          question_number: number
          question_text: string
          skill_name: string
          updated_at: string | null
          visual_elements: Json | null
        }
        Insert: {
          choices: Json
          correct_answer: string
          created_at?: string | null
          difficulty: string
          exam_link_id: string
          explanation?: string | null
          id?: string
          image_urls?: string[] | null
          is_edited?: boolean | null
          is_from_bank?: boolean | null
          original_question?: Json | null
          question_bank_id?: string | null
          question_number: number
          question_text: string
          skill_name: string
          updated_at?: string | null
          visual_elements?: Json | null
        }
        Update: {
          choices?: Json
          correct_answer?: string
          created_at?: string | null
          difficulty?: string
          exam_link_id?: string
          explanation?: string | null
          id?: string
          image_urls?: string[] | null
          is_edited?: boolean | null
          is_from_bank?: boolean | null
          original_question?: Json | null
          question_bank_id?: string | null
          question_number?: number
          question_text?: string
          skill_name?: string
          updated_at?: string | null
          visual_elements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_link_id_fkey"
            columns: ["exam_link_id"]
            isOneToOne: false
            referencedRelation: "exam_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_bank_id_fkey"
            columns: ["question_bank_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sessions: {
        Row: {
          assessment_data: Json | null
          assessment_type: string
          attempt_number: number | null
          auto_saved_at: string | null
          choices_order: Json | null
          completed_at: string
          correct_answers: number
          created_at: string
          draft_answers: Json | null
          exam_link_id: string
          grade: number
          id: string
          is_draft: boolean | null
          question_order: Json | null
          score: number
          semester: number | null
          started_at: string
          student_class: string
          student_name: string
          student_number: number
          time_taken: number
          total_questions: number
        }
        Insert: {
          assessment_data?: Json | null
          assessment_type?: string
          attempt_number?: number | null
          auto_saved_at?: string | null
          choices_order?: Json | null
          completed_at?: string
          correct_answers: number
          created_at?: string
          draft_answers?: Json | null
          exam_link_id: string
          grade: number
          id?: string
          is_draft?: boolean | null
          question_order?: Json | null
          score: number
          semester?: number | null
          started_at?: string
          student_class: string
          student_name: string
          student_number: number
          time_taken: number
          total_questions: number
        }
        Update: {
          assessment_data?: Json | null
          assessment_type?: string
          attempt_number?: number | null
          auto_saved_at?: string | null
          choices_order?: Json | null
          completed_at?: string
          correct_answers?: number
          created_at?: string
          draft_answers?: Json | null
          exam_link_id?: string
          grade?: number
          id?: string
          is_draft?: boolean | null
          question_order?: Json | null
          score?: number
          semester?: number | null
          started_at?: string
          student_class?: string
          student_name?: string
          student_number?: number
          time_taken?: number
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_exam_link_id_fkey"
            columns: ["exam_link_id"]
            isOneToOne: false
            referencedRelation: "exam_links"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          ai_reasoning: string | null
          created_at: string
          current_step: number
          difficulty_progression: string
          estimated_duration: number | null
          id: string
          path_name: string
          skills_to_focus: string[]
          status: string
          total_steps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string
          current_step?: number
          difficulty_progression: string
          estimated_duration?: number | null
          id?: string
          path_name: string
          skills_to_focus: string[]
          status?: string
          total_steps: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string
          current_step?: number
          difficulty_progression?: string
          estimated_duration?: number | null
          id?: string
          path_name?: string
          skills_to_focus?: string[]
          status?: string
          total_steps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      level_assessments: {
        Row: {
          assessment_data: Json | null
          assessment_type: string | null
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          grade: number
          id: string
          score: number | null
          semester: number | null
          time_taken: number | null
          total_questions: number | null
          user_id: string
          weighted_score: number | null
        }
        Insert: {
          assessment_data?: Json | null
          assessment_type?: string | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          grade: number
          id?: string
          score?: number | null
          semester?: number | null
          time_taken?: number | null
          total_questions?: number | null
          user_id: string
          weighted_score?: number | null
        }
        Update: {
          assessment_data?: Json | null
          assessment_type?: string | null
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          grade?: number
          id?: string
          score?: number | null
          semester?: number | null
          time_taken?: number | null
          total_questions?: number | null
          user_id?: string
          weighted_score?: number | null
        }
        Relationships: []
      }
      line_link_codes: {
        Row: {
          account_number: number | null
          created_at: string | null
          expires_at: string
          id: string
          line_user_id: string | null
          link_code: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: number | null
          created_at?: string | null
          expires_at: string
          id?: string
          line_user_id?: string | null
          link_code: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: number | null
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
      mission_rewards: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          reward_description: string | null
          reward_name: string
          reward_type: string
          stars_required: number
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          reward_description?: string | null
          reward_name: string
          reward_type: string
          stars_required: number
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          reward_description?: string | null
          reward_name?: string
          reward_type?: string
          stars_required?: number
        }
        Relationships: []
      }
      notification_job_logs: {
        Row: {
          created_at: string
          errors: Json | null
          execution_time_ms: number | null
          id: string
          job_name: string
          messages_sent: number | null
          messages_skipped: number | null
          skip_reasons: Json | null
          triggered_at: string
          users_found: number | null
        }
        Insert: {
          created_at?: string
          errors?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_name: string
          messages_sent?: number | null
          messages_skipped?: number | null
          skip_reasons?: Json | null
          triggered_at?: string
          users_found?: number | null
        }
        Update: {
          created_at?: string
          errors?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_name?: string
          messages_sent?: number | null
          messages_skipped?: number | null
          skip_reasons?: Json | null
          triggered_at?: string
          users_found?: number | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          streak_warning: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          streak_warning?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          streak_warning?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          accuracy: number
          created_at: string
          difficulty: string
          hints_used: number
          id: string
          problems_attempted: number
          problems_correct: number
          session_date: string
          skill_name: string
          time_spent: number
          user_id: string
        }
        Insert: {
          accuracy: number
          created_at?: string
          difficulty: string
          hints_used?: number
          id?: string
          problems_attempted: number
          problems_correct: number
          session_date?: string
          skill_name: string
          time_spent: number
          user_id: string
        }
        Update: {
          accuracy?: number
          created_at?: string
          difficulty?: string
          hints_used?: number
          id?: string
          problems_attempted?: number
          problems_correct?: number
          session_date?: string
          skill_name?: string
          time_spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
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
      progress_view_tokens: {
        Row: {
          accessed_at: string | null
          created_at: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_view_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      question_bank: {
        Row: {
          admin_id: string | null
          ai_generated: boolean | null
          assessment_type: string | null
          choices: Json
          correct_answer: string
          created_at: string | null
          difficulty: string
          explanation: string | null
          grade: number
          id: string
          image_urls: string[] | null
          is_system_question: boolean | null
          is_template: boolean | null
          question_text: string
          semester: number | null
          skill_name: string
          subject: string
          tags: string[] | null
          teacher_id: string | null
          template_variables: Json | null
          times_used: number | null
          topic: string | null
          updated_at: string | null
          visual_elements: Json | null
        }
        Insert: {
          admin_id?: string | null
          ai_generated?: boolean | null
          assessment_type?: string | null
          choices: Json
          correct_answer: string
          created_at?: string | null
          difficulty: string
          explanation?: string | null
          grade: number
          id?: string
          image_urls?: string[] | null
          is_system_question?: boolean | null
          is_template?: boolean | null
          question_text: string
          semester?: number | null
          skill_name: string
          subject?: string
          tags?: string[] | null
          teacher_id?: string | null
          template_variables?: Json | null
          times_used?: number | null
          topic?: string | null
          updated_at?: string | null
          visual_elements?: Json | null
        }
        Update: {
          admin_id?: string | null
          ai_generated?: boolean | null
          assessment_type?: string | null
          choices?: Json
          correct_answer?: string
          created_at?: string | null
          difficulty?: string
          explanation?: string | null
          grade?: number
          id?: string
          image_urls?: string[] | null
          is_system_question?: boolean | null
          is_template?: boolean | null
          question_text?: string
          semester?: number | null
          skill_name?: string
          subject?: string
          tags?: string[] | null
          teacher_id?: string | null
          template_variables?: Json | null
          times_used?: number | null
          topic?: string | null
          updated_at?: string | null
          visual_elements?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      question_templates: {
        Row: {
          answer_formula: string
          assessment_type: string | null
          choices_formula: Json | null
          created_at: string | null
          difficulty: string
          grade: number
          id: string
          semester: number | null
          teacher_id: string
          template_name: string
          template_text: string
          times_used: number | null
          topic: string | null
          updated_at: string | null
          variables: Json
        }
        Insert: {
          answer_formula: string
          assessment_type?: string | null
          choices_formula?: Json | null
          created_at?: string | null
          difficulty: string
          grade: number
          id?: string
          semester?: number | null
          teacher_id: string
          template_name: string
          template_text: string
          times_used?: number | null
          topic?: string | null
          updated_at?: string | null
          variables: Json
        }
        Update: {
          answer_formula?: string
          assessment_type?: string | null
          choices_formula?: Json | null
          created_at?: string | null
          difficulty?: string
          grade?: number
          id?: string
          semester?: number | null
          teacher_id?: string
          template_name?: string
          template_text?: string
          times_used?: number | null
          topic?: string | null
          updated_at?: string | null
          variables?: Json
        }
        Relationships: []
      }
      school_memberships: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          joined_at: string
          role: Database["public"]["Enums"]["school_role"]
          school_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role: Database["public"]["Enums"]["school_role"]
          school_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: Database["public"]["Enums"]["school_role"]
          school_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_memberships_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          code: string
          created_at: string
          district: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          province: string | null
          settings: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          province?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          province?: string | null
          settings?: Json | null
          updated_at?: string
          website?: string | null
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
      shared_questions: {
        Row: {
          copy_count: number
          created_at: string
          id: string
          is_public: boolean
          question_id: string
          share_code: string | null
          shared_by: string
          view_count: number
        }
        Insert: {
          copy_count?: number
          created_at?: string
          id?: string
          is_public?: boolean
          question_id: string
          share_code?: string | null
          shared_by: string
          view_count?: number
        }
        Update: {
          copy_count?: number
          created_at?: string
          id?: string
          is_public?: boolean
          question_id?: string
          share_code?: string | null
          shared_by?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_questions_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_templates: {
        Row: {
          copy_count: number
          created_at: string
          id: string
          is_public: boolean
          share_code: string | null
          shared_by: string
          template_id: string
          view_count: number
        }
        Insert: {
          copy_count?: number
          created_at?: string
          id?: string
          is_public?: boolean
          share_code?: string | null
          shared_by: string
          template_id: string
          view_count?: number
        }
        Update: {
          copy_count?: number
          created_at?: string
          id?: string
          is_public?: boolean
          share_code?: string | null
          shared_by?: string
          template_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "shared_templates_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "question_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessments: {
        Row: {
          accuracy_rate: number
          average_time: number | null
          correct_attempts: number
          created_at: string
          difficulty_level: string
          id: string
          last_practiced_at: string | null
          skill_name: string
          total_attempts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_rate?: number
          average_time?: number | null
          correct_attempts?: number
          created_at?: string
          difficulty_level?: string
          id?: string
          last_practiced_at?: string | null
          skill_name: string
          total_attempts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_rate?: number
          average_time?: number | null
          correct_attempts?: number
          created_at?: string
          difficulty_level?: string
          id?: string
          last_practiced_at?: string | null
          skill_name?: string
          total_attempts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      stem_activities: {
        Row: {
          accuracy: number | null
          activity_name: string
          activity_type: string
          category: string
          completed: boolean
          created_at: string
          id: string
          points_earned: number
          time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          activity_name: string
          activity_type: string
          category: string
          completed?: boolean
          created_at?: string
          id?: string
          points_earned?: number
          time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          activity_name?: string
          activity_type?: string
          category?: string
          completed?: boolean
          created_at?: string
          id?: string
          points_earned?: number
          time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stem_badges: {
        Row: {
          badge_category: string
          badge_code: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_category: string
          badge_code: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_category?: string
          badge_code?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      stem_daily_stats: {
        Row: {
          activities_completed: number
          category: string
          created_at: string
          date: string
          id: string
          total_points: number
          total_time_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activities_completed?: number
          category: string
          created_at?: string
          date?: string
          id?: string
          total_points?: number
          total_time_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activities_completed?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          total_points?: number
          total_time_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          exam_session_id: string | null
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          status: string
          student_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          exam_session_id?: string | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          exam_session_id?: string | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "class_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_exam_session_id_fkey"
            columns: ["exam_session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
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
      user_achievements: {
        Row: {
          achievement_code: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_code: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_code?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_code_fkey"
            columns: ["achievement_code"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["code"]
          },
        ]
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
          line_connected_at_2: string | null
          line_display_name: string | null
          line_display_name_2: string | null
          line_picture_url: string | null
          line_picture_url_2: string | null
          line_user_id: string | null
          line_user_id_2: string | null
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
          line_connected_at_2?: string | null
          line_display_name?: string | null
          line_display_name_2?: string | null
          line_picture_url?: string | null
          line_picture_url_2?: string | null
          line_user_id?: string | null
          line_user_id_2?: string | null
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
          line_connected_at_2?: string | null
          line_display_name?: string | null
          line_display_name_2?: string | null
          line_picture_url?: string | null
          line_picture_url_2?: string | null
          line_user_id?: string | null
          line_user_id_2?: string | null
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
      user_rewards: {
        Row: {
          earned_at: string | null
          id: string
          is_equipped: boolean | null
          reward_id: string
          user_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          is_equipped?: boolean | null
          reward_id: string
          user_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          is_equipped?: boolean | null
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "mission_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_registrations"
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
      user_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_completed_date: string | null
          longest_streak: number | null
          perfect_days: number | null
          total_missions_completed: number | null
          total_stars_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_completed_date?: string | null
          longest_streak?: number | null
          perfect_days?: number | null
          total_missions_completed?: number | null
          total_stars_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_completed_date?: string | null
          longest_streak?: number | null
          perfect_days?: number | null
          total_missions_completed?: number | null
          total_stars_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_registrations"
            referencedColumns: ["id"]
          },
        ]
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
          is_teacher: boolean
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
      assign_teacher_role: {
        Args: { p_admin_email: string; p_user_id: string }
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
      check_and_award_achievements: {
        Args: { p_score: number; p_time_taken: number; p_user_id: string }
        Returns: {
          new_achievement_code: string
          new_achievement_name: string
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
      cleanup_expired_tokens: { Args: never; Returns: undefined }
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
      generate_share_code: { Args: never; Returns: string }
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
      get_user_schools: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_school_role: {
        Args: {
          _role: Database["public"]["Enums"]["school_role"]
          _school_id: string
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
      is_admin: { Args: { p_admin_id: string }; Returns: boolean }
      is_authenticated_admin: { Args: never; Returns: boolean }
      is_school_admin: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      is_school_member: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
      is_school_teacher: {
        Args: { _school_id: string; _user_id: string }
        Returns: boolean
      }
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
      remove_teacher_role: {
        Args: { p_admin_email: string; p_user_id: string }
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
      update_skill_assessment: {
        Args: {
          p_correct: boolean
          p_skill_name: string
          p_time_spent: number
          p_user_id: string
        }
        Returns: undefined
      }
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
      app_role: "admin" | "parent" | "user" | "teacher"
      school_role: "school_admin" | "teacher" | "student"
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
      app_role: ["admin", "parent", "user", "teacher"],
      school_role: ["school_admin", "teacher", "student"],
    },
  },
} as const
