export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          id: string
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          author: string | null
          category: string
          confidence_score: number | null
          content: string
          created_at: string
          created_by: string | null
          difficulty_level: string | null
          document_type: string
          embedding: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          source_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string
          confidence_score?: number | null
          content: string
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          document_type?: string
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          confidence_score?: number | null
          content?: string
          created_at?: string
          created_by?: string | null
          difficulty_level?: string | null
          document_type?: string
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      rl_agent_metrics: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          session_id: string | null
          timestamp: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          session_id?: string | null
          timestamp?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          session_id?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      rl_feedback: {
        Row: {
          agent_id: string
          context: Json | null
          created_at: string
          feedback_type: string
          feedback_value: Json
          id: string
          processed: boolean | null
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          context?: Json | null
          created_at?: string
          feedback_type: string
          feedback_value: Json
          id?: string
          processed?: boolean | null
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          context?: Json | null
          created_at?: string
          feedback_type?: string
          feedback_value?: Json
          id?: string
          processed?: boolean | null
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rl_system_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_data: Json
          interaction_type: string
          outcome: Json | null
          session_id: string | null
          system_state: Json | null
          target_element: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_data: Json
          interaction_type: string
          outcome?: Json | null
          session_id?: string | null
          system_state?: Json | null
          target_element?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_data?: Json
          interaction_type?: string
          outcome?: Json | null
          session_id?: string | null
          system_state?: Json | null
          target_element?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rl_training_sessions: {
        Row: {
          agent_ids: string[]
          configuration: Json | null
          convergence_achieved: boolean | null
          created_at: string
          end_time: string | null
          environment_id: string
          id: string
          session_name: string
          start_time: string
          status: string
          total_episodes: number | null
          total_rewards: number | null
          updated_at: string
        }
        Insert: {
          agent_ids: string[]
          configuration?: Json | null
          convergence_achieved?: boolean | null
          created_at?: string
          end_time?: string | null
          environment_id: string
          id?: string
          session_name: string
          start_time?: string
          status?: string
          total_episodes?: number | null
          total_rewards?: number | null
          updated_at?: string
        }
        Update: {
          agent_ids?: string[]
          configuration?: Json | null
          convergence_achieved?: boolean | null
          created_at?: string
          end_time?: string | null
          environment_id?: string
          id?: string
          session_name?: string
          start_time?: string
          status?: string
          total_episodes?: number | null
          total_rewards?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      search_document_chunks: {
        Args: {
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
          user_id?: string
        }
        Returns: {
          id: string
          document_id: string
          content: string
          chunk_index: number
          similarity: number
          document_title: string
          document_created_at: string
        }[]
      }
      search_knowledge: {
        Args: {
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
          filter_category?: string
          filter_type?: string
        }
        Returns: {
          id: string
          document_id: string
          title: string
          content: string
          document_type: string
          category: string
          tags: string[]
          confidence_score: number
          similarity: number
          metadata: Json
        }[]
      }
      search_knowledge_documents: {
        Args: {
          query_embedding: string
          similarity_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          content: string
          document_type: string
          category: string
          tags: string[]
          similarity: number
          metadata: Json
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
