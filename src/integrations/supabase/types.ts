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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      inventory_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          product_key: string
          reorder_level: number
          shop_id: string
          sku: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          product_key: string
          reorder_level?: number
          shop_id: string
          sku?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          product_key?: string
          reorder_level?: number
          shop_id?: string
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          product_key: string
          quantity: number
          reference: string | null
          shop_id: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          product_key: string
          quantity: number
          reference?: string | null
          shop_id: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          product_key?: string
          quantity?: number
          reference?: string | null
          shop_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_key: string
          item_name: string
          item_type: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_key: string
          item_name: string
          item_type?: string
          order_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          id?: string
          item_key?: string
          item_name?: string
          item_type?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string | null
          country: string
          created_at: string
          currency_label: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          deleted_at: string | null
          delivery_address: string | null
          id: string
          order_ref: string
          status: string
          subtotal: number
          total: number
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string
          created_at?: string
          currency_label?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          deleted_at?: string | null
          delivery_address?: string | null
          id?: string
          order_ref: string
          status?: string
          subtotal?: number
          total?: number
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          currency_label?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          deleted_at?: string | null
          delivery_address?: string | null
          id?: string
          order_ref?: string
          status?: string
          subtotal?: number
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          admin_notes: string | null
          created_at: string
          file_url: string
          id: string
          order_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          file_url: string
          id?: string
          order_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          file_url?: string
          id?: string
          order_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          admin_notes: string | null
          created_at: string
          file_url: string
          id: string
          otp_code: string | null
          plan_type: string | null
          receipt_type: string
          reviewed_at: string | null
          shop_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          file_url: string
          id?: string
          otp_code?: string | null
          plan_type?: string | null
          receipt_type?: string
          reviewed_at?: string | null
          shop_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          file_url?: string
          id?: string
          otp_code?: string | null
          plan_type?: string | null
          receipt_type?: string
          reviewed_at?: string | null
          shop_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_order_items: {
        Row: {
          id: string
          item_key: string
          item_name: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_key: string
          item_name: string
          order_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          id?: string
          item_key?: string
          item_name?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          city: string | null
          country: string
          created_at: string
          currency_label: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string | null
          id: string
          order_ref: string
          shop_id: string
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          city?: string | null
          country?: string
          created_at?: string
          currency_label?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address?: string | null
          id?: string
          order_ref: string
          shop_id: string
          status?: string
          subtotal?: number
          total?: number
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          currency_label?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string | null
          id?: string
          order_ref?: string
          shop_id?: string
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          plan: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          plan: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          activated_at: string | null
          contact_info: string | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          payment_instructions: string | null
          plan_status: string
          plan_type: string | null
          renewal_at: string | null
          slug: string
          sponsor_ref: string | null
          status: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          activated_at?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          payment_instructions?: string | null
          plan_status?: string
          plan_type?: string | null
          renewal_at?: string | null
          slug: string
          sponsor_ref?: string | null
          status?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          activated_at?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          payment_instructions?: string | null
          plan_status?: string
          plan_type?: string | null
          renewal_at?: string | null
          slug?: string
          sponsor_ref?: string | null
          status?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      stock_replenishment_items: {
        Row: {
          id: string
          product_key: string
          quantity: number
          replenishment_id: string
          unit_cost: number
        }
        Insert: {
          id?: string
          product_key: string
          quantity?: number
          replenishment_id: string
          unit_cost?: number
        }
        Update: {
          id?: string
          product_key?: string
          quantity?: number
          replenishment_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_replenishment_items_replenishment_id_fkey"
            columns: ["replenishment_id"]
            isOneToOne: false
            referencedRelation: "stock_replenishments"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_replenishments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          shop_id: string
          status: Database["public"]["Enums"]["replenishment_status"]
          supplier_name: string | null
          total_cost: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          shop_id: string
          status?: Database["public"]["Enums"]["replenishment_status"]
          supplier_name?: string | null
          total_cost?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          shop_id?: string
          status?: Database["public"]["Enums"]["replenishment_status"]
          supplier_name?: string | null
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_replenishments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      create_order_with_items: { Args: { payload: Json }; Returns: Json }
      get_shop_stock: {
        Args: { p_shop_id: string }
        Returns: {
          current_stock: number
          product_key: string
          reorder_level: number
        }[]
      }
      get_stock_level: {
        Args: { p_product_key: string; p_shop_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      receive_replenishment: {
        Args: { p_replenishment_id: string }
        Returns: undefined
      }
      record_sale_movements: {
        Args: { p_order_id: string; p_shop_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      inventory_movement_type:
        | "INITIAL"
        | "RESTOCK"
        | "SALE"
        | "ADJUSTMENT"
        | "TRANSFER_IN"
        | "TRANSFER_OUT"
        | "RETURN"
      replenishment_status: "DRAFT" | "RECEIVED" | "CANCELLED"
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
      app_role: ["admin", "moderator", "user"],
      inventory_movement_type: [
        "INITIAL",
        "RESTOCK",
        "SALE",
        "ADJUSTMENT",
        "TRANSFER_IN",
        "TRANSFER_OUT",
        "RETURN",
      ],
      replenishment_status: ["DRAFT", "RECEIVED", "CANCELLED"],
    },
  },
} as const
