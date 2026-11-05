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
          staff_role: Database["public"]["Enums"]["admin_staff_role"];
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
          staff_role?: Database["public"]["Enums"]["admin_staff_role"];
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
          staff_role?: Database["public"]["Enums"]["admin_staff_role"];
          updated_at?: string;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
      partner_accounts: {
        Row: {
          created_at: string;
          display_name: string;
          hospital_application_id: string | null;
          is_active: boolean;
          last_login_at: string | null;
          must_change_password: boolean;
          role: "hospital" | "provider";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          hospital_application_id?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          must_change_password?: boolean;
          role: "hospital" | "provider";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          hospital_application_id?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          must_change_password?: boolean;
          role?: "hospital" | "provider";
          updated_at?: string;
          user_id?: string;
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
      admin_notifications: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          notification_type: string;
          recipient_admin: string | null;
          related_record_id: string | null;
          related_record_type: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          notification_type: string;
          recipient_admin?: string | null;
          related_record_id?: string | null;
          related_record_type: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          notification_type?: string;
          recipient_admin?: string | null;
          related_record_id?: string | null;
          related_record_type?: string;
          title?: string;
        };
        Relationships: [];
      };
      admin_notification_reads: {
        Row: { admin_user_id: string; notification_id: string; read_at: string };
        Insert: { admin_user_id: string; notification_id: string; read_at?: string };
        Update: { admin_user_id?: string; notification_id?: string; read_at?: string };
        Relationships: [];
      };
      device_requests: {
        Row: {
          assigned_admin: string | null;
          completed_at: string | null;
          created_at: string;
          dashcam_quantity: number;
          device_category: string;
          gps_quantity: number;
          hospital_application_id: string;
          id: string;
          request_description: string | null;
          request_number: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["website_request_status"];
          updated_at: string;
          vehicle_quantity: number | null;
        };
        Insert: {
          assigned_admin?: string | null;
          completed_at?: string | null;
          created_at?: string;
          dashcam_quantity?: number;
          device_category: string;
          gps_quantity?: number;
          hospital_application_id: string;
          id?: string;
          request_description?: string | null;
          request_number?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["website_request_status"];
          updated_at?: string;
          vehicle_quantity?: number | null;
        };
        Update: {
          assigned_admin?: string | null;
          completed_at?: string | null;
          created_at?: string;
          dashcam_quantity?: number;
          device_category?: string;
          gps_quantity?: number;
          hospital_application_id?: string;
          id?: string;
          request_description?: string | null;
          request_number?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["website_request_status"];
          updated_at?: string;
          vehicle_quantity?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "device_requests_hospital_application_id_fkey";
            columns: ["hospital_application_id"];
            isOneToOne: false;
            referencedRelation: "hospital_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      device_request_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          device_request_id: string;
          id: string;
          new_status: Database["public"]["Enums"]["website_request_status"];
          previous_status: Database["public"]["Enums"]["website_request_status"] | null;
          reason: string | null;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          device_request_id: string;
          id?: string;
          new_status: Database["public"]["Enums"]["website_request_status"];
          previous_status?: Database["public"]["Enums"]["website_request_status"] | null;
          reason?: string | null;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          device_request_id?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["website_request_status"];
          previous_status?: Database["public"]["Enums"]["website_request_status"] | null;
          reason?: string | null;
        };
        Relationships: [];
      };
      device_request_notes: {
        Row: {
          author_id: string | null;
          body: string;
          created_at: string;
          device_request_id: string;
          id: string;
        };
        Insert: {
          author_id?: string | null;
          body: string;
          created_at?: string;
          device_request_id: string;
          id?: string;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          created_at?: string;
          device_request_id?: string;
          id?: string;
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
      admin_notification_inbox: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          notification_type: string;
          read_at: string | null;
          recipient_admin: string | null;
          related_record_id: string | null;
          related_record_type: string;
          title: string;
        };
        Relationships: [];
      };
      website_request_index: {
        Row: {
          category: string | null;
          hospital_name: string | null;
          id: string | null;
          request_number: string | null;
          source: string | null;
          status: string | null;
          submitted_at: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
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
      change_device_request_status: {
        Args: {
          _id: string;
          _new: Database["public"]["Enums"]["website_request_status"];
          _reason?: string;
        };
        Returns: Database["public"]["Tables"]["device_requests"]["Row"];
      };
      change_inquiry_status: {
        Args: { _id: string; _new: string };
        Returns: Database["public"]["Tables"]["contact_inquiries"]["Row"];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      has_admin_permission: { Args: { _permission: string }; Returns: boolean };
      list_admin_directory: {
        Args: never;
        Returns: { display_name: string | null; user_id: string; username: string }[];
      };
      has_partner_access: {
        Args: { _role: Database["public"]["Enums"]["app_role"] };
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
      mark_partner_password_changed: { Args: never; Returns: undefined };
      mark_admin_password_changed: { Args: never; Returns: undefined };
      record_admin_login: { Args: never; Returns: undefined };
      record_partner_login: {
        Args: { _role: Database["public"]["Enums"]["app_role"] };
        Returns: undefined;
      };
      set_admin_staff_role: {
        Args: {
          _role: Database["public"]["Enums"]["admin_staff_role"];
          _user_id: string;
        };
        Returns: Database["public"]["Tables"]["admin_profiles"]["Row"];
      };
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
      update_own_admin_profile: {
        Args: { _display_name: string };
        Returns: Database["public"]["Tables"]["admin_profiles"]["Row"];
      };
    };
    Enums: {
      admin_staff_role: "super_admin" | "application_manager" | "request_manager" | "report_viewer";
      app_role: "admin" | "hospital" | "provider";
      application_status:
        "pending" | "under_review" | "changes_requested" | "approved" | "rejected";
      partnership_status: "active" | "suspended";
      website_request_status:
        | "new"
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "in_progress"
        | "completed"
        | "cancelled";
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
      admin_staff_role: ["super_admin", "application_manager", "request_manager", "report_viewer"],
      app_role: ["admin", "hospital", "provider"],
      application_status: ["pending", "under_review", "changes_requested", "approved", "rejected"],
      partnership_status: ["active", "suspended"],
      website_request_status: [
        "new",
        "pending",
        "under_review",
        "approved",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const;
