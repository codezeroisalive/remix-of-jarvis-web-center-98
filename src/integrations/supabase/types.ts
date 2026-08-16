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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      authorized_people: {
        Row: {
          active: boolean
          created_by: string | null
          enrolled_at: string
          id: string
          internal_id: string
          is_demo: boolean
          name: string
          organization: string | null
          permission_level: string
          photo_url: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_by?: string | null
          enrolled_at?: string
          id?: string
          internal_id: string
          is_demo?: boolean
          name: string
          organization?: string | null
          permission_level?: string
          photo_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_by?: string | null
          enrolled_at?: string
          id?: string
          internal_id?: string
          is_demo?: boolean
          name?: string
          organization?: string | null
          permission_level?: string
          photo_url?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      camera_credentials: {
        Row: {
          camera_id: string
          notes: string | null
          password_encrypted: string | null
          rtsp_url: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          camera_id: string
          notes?: string | null
          password_encrypted?: string | null
          rtsp_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          camera_id?: string
          notes?: string | null
          password_encrypted?: string | null
          rtsp_url?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camera_credentials_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: true
            referencedRelation: "security_cameras"
            referencedColumns: ["id"]
          },
        ]
      }
      js_experiments: {
        Row: {
          controlled_vars: string | null
          created_at: string
          dependent_var: string | null
          id: string
          independent_var: string | null
          project_id: string | null
          rows: Json
          title: string
          user_id: string
        }
        Insert: {
          controlled_vars?: string | null
          created_at?: string
          dependent_var?: string | null
          id?: string
          independent_var?: string | null
          project_id?: string | null
          rows?: Json
          title: string
          user_id: string
        }
        Update: {
          controlled_vars?: string | null
          created_at?: string
          dependent_var?: string | null
          id?: string
          independent_var?: string | null
          project_id?: string | null
          rows?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      js_profiles: {
        Row: {
          budget: string | null
          class_level: string | null
          competition_level: string | null
          components: string | null
          days_available: number | null
          subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: string | null
          class_level?: string | null
          competition_level?: string | null
          components?: string | null
          days_available?: number | null
          subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: string | null
          class_level?: string | null
          competition_level?: string | null
          components?: string | null
          days_available?: number | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      js_project_docs: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          section: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          section: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          section?: string
          user_id?: string
        }
        Relationships: []
      }
      js_saved_projects: {
        Row: {
          created_at: string
          id: string
          meta: Json
          notes: string | null
          progress: Json
          project_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json
          notes?: string | null
          progress?: Json
          project_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json
          notes?: string | null
          progress?: Json
          project_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          event_id: string | null
          id: string
          is_demo: boolean
          message: string
          severity: string
          title: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          is_demo?: boolean
          message: string
          severity?: string
          title: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          is_demo?: boolean
          message?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_alerts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "security_events"
            referencedColumns: ["id"]
          },
        ]
      }
      security_cameras: {
        Row: {
          camera_code: string
          camera_type: string
          created_at: string
          created_by: string | null
          field_of_view: number | null
          id: string
          is_demo: boolean
          last_heartbeat: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          preview_url: string | null
          recording: boolean
          status: string
          stream_url: string | null
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          camera_code: string
          camera_type?: string
          created_at?: string
          created_by?: string | null
          field_of_view?: number | null
          id?: string
          is_demo?: boolean
          last_heartbeat?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          preview_url?: string | null
          recording?: boolean
          status?: string
          stream_url?: string | null
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          camera_code?: string
          camera_type?: string
          created_at?: string
          created_by?: string | null
          field_of_view?: number | null
          id?: string
          is_demo?: boolean
          last_heartbeat?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          preview_url?: string | null
          recording?: boolean
          status?: string
          stream_url?: string | null
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_cameras_zone_fk"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "security_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          camera_id: string | null
          confidence: number | null
          created_at: string
          details: Json | null
          event_type: string
          id: string
          is_demo: boolean
          occurred_at: string
          person_id: string | null
          severity: string
          snapshot_url: string | null
          zone_id: string | null
        }
        Insert: {
          camera_id?: string | null
          confidence?: number | null
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          is_demo?: boolean
          occurred_at?: string
          person_id?: string | null
          severity?: string
          snapshot_url?: string | null
          zone_id?: string | null
        }
        Update: {
          camera_id?: string | null
          confidence?: number | null
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          is_demo?: boolean
          occurred_at?: string
          person_id?: string | null
          severity?: string
          snapshot_url?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_camera_id_fkey"
            columns: ["camera_id"]
            isOneToOne: false
            referencedRelation: "security_cameras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "authorized_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "security_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      security_zones: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_demo: boolean
          name: string
          polygon: Json | null
          rules: Json | null
          updated_at: string
          zone_type: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_demo?: boolean
          name: string
          polygon?: Json | null
          rules?: Json | null
          updated_at?: string
          zone_type?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          polygon?: Json | null
          rules?: Json | null
          updated_at?: string
          zone_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      claim_admin_if_first: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "viewer"
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
      app_role: ["admin", "operator", "viewer"],
    },
  },
} as const
