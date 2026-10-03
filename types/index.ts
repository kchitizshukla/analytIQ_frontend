// Frontend types — kept aligned with backend Pydantic schemas.

export type ColumnType =
  | "numeric" | "currency" | "percentage" | "datetime"
  | "boolean" | "categorical" | "text";

export interface DatasetColumn {
  name: string;
  type: ColumnType;
  nullable: boolean;
  unique_count: number;
  null_count: number;
  sample_values: unknown[];
  stats: Record<string, unknown>;
}

export interface DatasetSummary {
  id: string;
  name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  row_count: number;
  column_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SheetInfo {
  sheet_name: string;
  row_count: number;
  column_count: number;
}

export interface DatasetDetail extends DatasetSummary {
  error_message?: string | null;
  columns: DatasetColumn[];
  sheets: SheetInfo[];
}

export interface ColumnsResponse {
  dataset_id: string;
  columns: DatasetColumn[];
}

export interface DatasetPreview {
  dataset_id: string;
  columns: string[];
  rows: Record<string, unknown>[];
  total_rows: number;
  page: number;
  page_size: number;
}

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  min?: number; max?: number; mean?: number; median?: number; std?: number;
  p25?: number; p75?: number; outlier_count?: number;
  top_values?: { value: string; count: number }[];
}

export interface DataProfile {
  dataset_id: string;
  row_count: number;
  column_count: number;
  missing_values: number;
  missing_percentage: number;
  duplicate_rows: number;
  numeric_columns: string[];
  categorical_columns: string[];
  datetime_columns: string[];
  completeness: number;
  quality_score: number;
  columns: ColumnProfile[];
}

export type ChartType =
  | "bar" | "grouped_bar" | "line" | "area" | "pie" | "scatter" | "histogram" | "table";

export interface FilterClause {
  column: string;
  op: string;
  value: unknown;
}

export interface VisualizationConfig {
  dataset_id: string;
  chart_type: ChartType;
  dimension?: string | null;
  measures: string[];
  group_by?: string | null;
  aggregation: Record<string, string>;
  default_aggregation?: string;
  filters: FilterClause[];
  limit?: number | null;
  sort?: string | null;
  title?: string | null;
}

export interface SeriesData {
  name: string;
  data: unknown[];
}

export interface VisualizationResult {
  dataset_id: string;
  chart_type: ChartType;
  title: string;
  dimension?: string | null;
  measures: string[];
  categories: (string | number)[];
  series: SeriesData[];
  rows: Record<string, unknown>[];
  recommended_chart?: string | null;
  notes: string[];
}

export interface Insight {
  id?: string;
  insight_type: string;
  title: string;
  description: string;
  data: Record<string, unknown>;
  severity: "info" | "positive" | "warning" | "critical";
  created_at?: string;
}

export interface InsightsResponse {
  dataset_id: string;
  generated_with_ai: boolean;
  insights: Insight[];
}

export interface ChatSession {
  id: string;
  dataset_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  dataset_id: string | null;
  dataset_name: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface KpiCard {
  label: string;
  value: string;
  delta?: string | null;
  trend?: string | null;
}

export interface SuggestedQuestion {
  label: string;
  question: string;
}

export type AssistantResponseType =
  | "text" | "table" | "kpi" | "visualization" | "analysis" | "error" | "clarification";

export interface AssistantResponse {
  session_id: string;
  message: string;
  response_type: AssistantResponseType;
  data: Record<string, any>;
  kpis: KpiCard[];
  visualization: VisualizationResult | null;
  suggested_questions: SuggestedQuestion[];
  plan?: Record<string, unknown> | null;
  ai_available: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  database: string;
  llm_provider: string;
  llm_model: string;
  llm_available: boolean;
  environment: string;
}
