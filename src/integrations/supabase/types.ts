export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string;
          admin_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          metadata: Json;
        };
        Insert: {
          action: string;
          admin_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          metadata?: Json;
        };
        Update: {
          action?: string;
          admin_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      admin_profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          is_active: boolean;
          last_login_at: string | null;
          must_change_password: boolean;
          updated_at: string;
          user_id: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          must_change_password?: boolean;
          updated_at?: string;
          user_id: string;
          username: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          must_change_password?: boolean;
          updated_at?: string;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
      ambulances: {
        Row: {
          category: string | null;
          created_at: string;
          gps_available: string | null;
          hospital_application_id: string;
          id: string;
          registration_number: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          gps_available?: string | null;
          hospital_application_id: string;
          id?: string;
          registration_number: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          gps_available?: string | null;
          hospital_application_id?: string;
          id?: string;
          registration_number?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ambulances_hospital_application_id_fkey";
            columns: ["hospital_application_id"];
            isOneToOne: false;
            referencedRelation: "hospital_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_checklist: {
        Row: {
          check_key: string;
          checked_at: string | null;
          checked_by: string | null;
          hospital_application_id: string;
          id: string;
          is_checked: boolean;
          updated_at: string;
        };
        Insert: {
          check_key: string;
          checked_at?: string | null;
          checked_by?: string | null;
          hospital_application_id: string;
          id?: string;
          is_checked?: boolean;
          updated_at?: string;
        };
        Update: {
          check_key?: string;
          checked_at?: string | null;
          checked_by?: string | null;
          hospital_application_id?: string;
          id?: string;
          is_checked?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: string;
            columns: string[];
            isOneToOne: false;
            referencedRelation: string;
            referencedColumns: string[];
          },
        ];
      };
      application_documents: {
        Row: {
          document_type: string;
          file_size: number;
          hospital_application_id: string;
          id: string;
          mime_type: string;
          original_filename: string;
          private_storage_key: string;
          uploaded_at: string;
        };
        Insert: {
          document_type: string;
          file_size: number;
          hospital_application_id: string;
          id?: string;
          mime_type: string;
          original_filename: string;
          private_storage_key: string;
          uploaded_at?: string;
        };
        Update: {
          document_type?: string;
          file_size?: number;
          hospital_application_id?: string;
          id?: string;
          mime_type?: string;
          original_filename?: string;
          private_storage_key?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_documents_hospital_application_id_fkey";
            columns: ["hospital_application_id"];
            isOneToOne: false;
            referencedRelation: "hospital_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_notes: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          hospital_application_id: string;
          id: string;
        };
        Insert: {
          author_id?: string | null;
          body: string;
          created_at?: string;
          hospital_application_id: string;
          id?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          hospital_application_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_notes_hospital_application_id_fkey";
            columns: ["hospital_application_id"];
            isOneToOne: false;
            referencedRelation: "hospital_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      application_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          hospital_application_id: string;
          id: string;
          new_status: Database["public"]["Enums"]["application_status"];
          previous_status: Database["public"]["Enums"]["application_status"] | null;
          reason: string | null;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          hospital_application_id: string;
          id?: string;
          new_status: Database["public"]["Enums"]["application_status"];
          previous_status?: Database["public"]["Enums"]["application_status"] | null;
          reason?: string | null;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          hospital_application_id?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["application_status"];
          previous_status?: Database["public"]["Enums"]["application_status"] | null;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_status_history_hospital_application_id_fkey";
            columns: ["hospital_application_id"];
            isOneToOne: false;
            referencedRelation: "hospital_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_inquiries: {
        Row: {
          email: string;
          id: string;
          message: string;
          name: string;
          phone: string | null;
          resolved_at: string | null;
          status: string;
          subject: string;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          id?: string;
          message: string;
          name: string;
          phone?: string | null;
          resolved_at?: string | null;
          status?: string;
          subject: string;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          phone?: string | null;
          resolved_at?: string | null;
          status?: string;
          subject?: string;
          submitted_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drivers: {
        Row: {
          ambulance_id: string | null;
          created_at: string;
          full_name: string;
          hospital_application_id: string;
          id: string;
          licence_number: string;
          phone: string;
          updated_at: string;
        };
        Insert: {
          ambulance_id?: string | null;
          created_at?: string;
          full_name: string;
          hospital_application_id: string;
          id?: string;
          licence_number: string;
          phone: string;
          updated_at?: string;
        };
        Update: {
          ambulance_id?: string | null;
          created_at?: string;
          full_name?: string;
          hospital_application_id?: string;
          id?: string;
          licence_number?: string;
          phone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drivers_ambulance_id_fkey";
            columns: ["ambulance_id"];
            isOneToOne: false;
            referencedRelation: "ambulances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drivers_hospital_application_id_fkey";
            columns: ["hospital_application_id"];
            isOneToOne: false;
            referencedRelation: "hospital_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      hospital_applications: {
        Row: {
          additional_message: string | null;
          ambulance_categories: string | null;
          ambulance_count: number;
          ambulance_types: string[];
          application_reference: string;
          approved_at: string | null;
          assigned_reviewer: string | null;
          city_district: string | null;
          contact_person: string;
          created_at: string;
          email: string | null;
          gps_availability: string | null;
          hospital_address: string;
          hospital_name: string;
          id: string;
          partnership_status: Database["public"]["Enums"]["partnership_status"] | null;
          phone: string;
          follow_up_date: string | null;
          preferred_gps_tracking_method: string | null;
          rejection_reason: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["application_status"];
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          additional_message?: string | null;
          ambulance_categories?: string | null;
          ambulance_count?: number;
          ambulance_types?: string[];
          application_reference?: string;
          approved_at?: string | null;
          assigned_reviewer?: string | null;
          city_district?: string | null;
          contact_person: string;
          created_at?: string;
          email?: string | null;
          gps_availability?: string | null;
          hospital_address: string;
          hospital_name: string;
          id?: string;
          partnership_status?: Database["public"]["Enums"]["partnership_status"] | null;
          phone: string;
          follow_up_date?: string | null;
          preferred_gps_tracking_method?: string | null;
          rejection_reason?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          additional_message?: string | null;
          ambulance_categories?: string | null;
          ambulance_count?: number;
          ambulance_types?: string[];
          application_reference?: string;
          approved_at?: string | null;
          assigned_reviewer?: string | null;
          city_district?: string | null;
          contact_person?: string;
          created_at?: string;
          email?: string | null;
          gps_availability?: string | null;
          hospital_address?: string;
          hospital_name?: string;
          id?: string;
          partnership_status?: Database["public"]["Enums"]["partnership_status"] | null;
          phone?: string;
          follow_up_date?: string | null;
          preferred_gps_tracking_method?: string | null;
          rejection_reason?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      change_application_status: {
        Args: {
          _id: string;
          _new: Database["public"]["Enums"]["application_status"];
          _reason?: string;
        };
        Returns: {
          additional_message: string | null;
          ambulance_categories: string | null;
          ambulance_count: number;
          ambulance_types: string[];
          application_reference: string;
          approved_at: string | null;
          assigned_reviewer: string | null;
          city_district: string | null;
          contact_person: string;
          created_at: string;
          email: string | null;
          gps_availability: string | null;
          hospital_address: string;
          hospital_name: string;
          id: string;
          partnership_status: Database["public"]["Enums"]["partnership_status"] | null;
          phone: string;
          follow_up_date: string | null;
          preferred_gps_tracking_method: string | null;
          rejection_reason: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["application_status"];
          submitted_at: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "hospital_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      log_admin_action: {
        Args: {
          _action: string;
          _entity_id: string;
          _entity_type: string;
          _metadata?: Json;
        };
        Returns: undefined;
      };
      mark_admin_password_changed: { Args: never; Returns: undefined };
      record_admin_login: { Args: never; Returns: undefined };
      set_partnership_status: {
        Args: {
          _id: string;
          _reason?: string;
          _status: Database["public"]["Enums"]["partnership_status"];
        };
        Returns: {
          additional_message: string | null;
          ambulance_categories: string | null;
          ambulance_count: number;
          ambulance_types: string[];
          application_reference: string;
          approved_at: string | null;
          assigned_reviewer: string | null;
          city_district: string | null;
          contact_person: string;
          created_at: string;
          email: string | null;
          gps_availability: string | null;
          hospital_address: string;
          hospital_name: string;
          id: string;
          partnership_status: Database["public"]["Enums"]["partnership_status"] | null;
          phone: string;
          follow_up_date: string | null;
          preferred_gps_tracking_method: string | null;
          rejection_reason: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["application_status"];
          submitted_at: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "hospital_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      app_role: "admin" | "hospital";
      application_status:
        "pending" | "under_review" | "changes_requested" | "approved" | "rejected";
      partnership_status: "active" | "suspended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hospital"],
      application_status: ["pending", "under_review", "changes_requested", "approved", "rejected"],
      partnership_status: ["active", "suspended"],
    },
  },
} as const;
