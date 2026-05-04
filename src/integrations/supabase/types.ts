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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          full_name: string | null
          id: string
          is_default: boolean
          label: string | null
          line1: string
          line2: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          line1: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          line1?: string
          line2?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          ends_at: string | null
          id: string
          starts_at: string | null
          title: string
          type: Database["public"]["Enums"]["announcement_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          consultation_date: string
          created_at: string
          doctor_name: string | null
          id: string
          specialty: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consultation_date?: string
          created_at?: string
          doctor_name?: string | null
          id?: string
          specialty?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consultation_date?: string
          created_at?: string
          doctor_name?: string | null
          id?: string
          specialty?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          note: string
          pinned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note: string
          pinned?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note?: string
          pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string | null
          cta_link: string | null
          id: string
          image_url: string | null
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string
          file_path: string | null
          id: string
          notes: string | null
          result_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          id?: string
          notes?: string | null
          result_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          id?: string
          notes?: string | null
          result_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name_snapshot: string
          order_id: string
          price_snapshot: number
          product_id: string | null
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          id?: string
          name_snapshot: string
          order_id: string
          price_snapshot: number
          product_id?: string | null
          quantity?: number
          subtotal: number
        }
        Update: {
          created_at?: string
          id?: string
          name_snapshot?: string
          order_id?: string
          price_snapshot?: number
          product_id?: string | null
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          carrier: string | null
          created_at: string
          currency: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          promo_code: string | null
          shipping: number
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          carrier?: string | null
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          promo_code?: string | null
          shipping?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          carrier?: string | null
          created_at?: string
          currency?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          promo_code?: string | null
          shipping?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          active: boolean
          created_at: string
          dosage: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          refill_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          refill_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          refill_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: string[]
          category: string
          created_at: string
          featured: boolean
          how_to_use: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          ingredients: string | null
          long_description: string | null
          low_stock_threshold: number
          name: string
          price: number
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number
          stock_count: number
          updated_at: string
        }
        Insert: {
          benefits?: string[]
          category: string
          created_at?: string
          featured?: boolean
          how_to_use?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          ingredients?: string | null
          long_description?: string | null
          low_stock_threshold?: number
          name: string
          price?: number
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          stock_count?: number
          updated_at?: string
        }
        Update: {
          benefits?: string[]
          category?: string
          created_at?: string
          featured?: boolean
          how_to_use?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          ingredients?: string | null
          long_description?: string | null
          low_stock_threshold?: number
          name?: string
          price?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          stock_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          allergies: string[]
          avatar_url: string | null
          blood_type: string | null
          chronic_conditions: string[]
          created_at: string
          full_name: string | null
          height_cm: number | null
          id: string
          phone: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          subscription_started_at: string | null
          updated_at: string
          user_id: string
          username: string | null
          verified_patient: boolean
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[]
          avatar_url?: string | null
          blood_type?: string | null
          chronic_conditions?: string[]
          created_at?: string
          full_name?: string | null
          height_cm?: number | null
          id?: string
          phone?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_started_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          verified_patient?: boolean
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[]
          avatar_url?: string | null
          blood_type?: string | null
          chronic_conditions?: string[]
          created_at?: string
          full_name?: string | null
          height_cm?: number | null
          id?: string
          phone?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_started_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verified_patient?: boolean
          weight_kg?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          min_order: number
          updated_at: string
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
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
      admin_list_profiles_with_email: {
        Args: never
        Returns: {
          age: number
          allergies: string[]
          blood_type: string
          chronic_conditions: string[]
          created_at: string
          email: string
          full_name: string
          height_cm: number
          id: string
          phone: string
          subscription_plan: string
          user_id: string
          username: string
          verified_patient: boolean
          weight_kg: number
        }[]
      }
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _after?: Json
          _before?: Json
          _entity_id: string
          _entity_type: string
        }
        Returns: string
      }
    }
    Enums: {
      announcement_type: "info" | "warning" | "promo" | "success"
      app_role: "admin" | "user" | "staff" | "doctor"
      discount_type: "percent" | "fixed"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status: "unpaid" | "paid" | "refunded" | "failed"
      subscription_plan: "none" | "essential" | "family"
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
      announcement_type: ["info", "warning", "promo", "success"],
      app_role: ["admin", "user", "staff", "doctor"],
      discount_type: ["percent", "fixed"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: ["unpaid", "paid", "refunded", "failed"],
      subscription_plan: ["none", "essential", "family"],
    },
  },
} as const
