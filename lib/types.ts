// Tipos de domínio do PeabiruJobs.
// Espelham as tabelas do Supabase (supabase/migrations/0001_init.sql).

export type AnalysisStatus = "processing" | "completed" | "reanalyzed";

export type DocumentType =
  | "resume"
  | "linkedin_url"
  | "linkedin_pdf"
  | "job_description"
  | "complementary_file"
  | "pasted_text";

export type RecommendationCategory =
  | "competencia"
  | "comunicacao"
  | "evidencia"
  | "posicionamento";

export type Level = "alto" | "medio" | "baixo";
export type UrgencyLevel = "alta" | "media" | "baixa";
export type ItemStatus = "pendente" | "em_andamento" | "concluida";

export type FitType = "cargo_alvo" | "vaga_especifica";

export type FitLevel =
  | "Baixa aderência"
  | "Aderência parcial"
  | "Boa aderência"
  | "Alta aderência";

export type FitRecommendation =
  | "Aplicar agora"
  | "Aplicar com ajustes"
  | "Desenvolver lacunas antes de aplicar"
  | "Não priorizar esta vaga";

export type ActionType =
  | "Ajustar currículo"
  | "Atualizar LinkedIn"
  | "Desenvolver competência"
  | "Organizar evidência"
  | "Fazer curso"
  | "Revisar posicionamento"
  | "Analisar nova vaga";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  current_role: string | null;
  target_role: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerAnalysis {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  target_area: string | null;
  target_seniority: string | null;
  job_title: string | null;
  job_company: string | null;
  status: AnalysisStatus;
  overall_score: number | null;
  summary: string | null;
  main_strength: string | null;
  main_gap: string | null;
  next_best_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  analysis_id: string;
  document_type: DocumentType;
  file_url: string | null;
  raw_text: string | null;
  created_at: string;
}

export interface Recommendation {
  id: string;
  analysis_id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  impact: Level;
  effort: Level;
  urgency: UrgencyLevel;
  priority_order: number;
  suggested_action: string | null;
  reasoning: string | null;
  original_text: string | null;
  identified_issue: string | null;
  suggested_text: string | null;
  market_language_terms: string[] | null;
  authenticity_warning: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface FitDiagnostic {
  id: string;
  analysis_id: string;
  fit_type: FitType;
  score: number;
  level: FitLevel;
  strengths: string[];
  gaps: string[];
  risks: string[];
  recommendation: FitRecommendation;
  reasoning: string | null;
  created_at: string;
}

export interface EvolutionPlanAction {
  id: string;
  analysis_id: string;
  action_title: string;
  action_description: string;
  action_type: ActionType;
  priority: UrgencyLevel;
  timeframe: string | null;
  success_criteria: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface AnalysisVersion {
  id: string;
  original_analysis_id: string;
  new_analysis_id: string;
  user_id: string;
  improvements_summary: string | null;
  remaining_gaps: string | null;
  score_change: number | null;
  created_at: string;
}

// Rótulos de exibição (UI em pt-BR, valores canônicos no banco).
export const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  competencia: "Competência",
  comunicacao: "Comunicação",
  evidencia: "Evidência",
  posicionamento: "Posicionamento",
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export const ANALYSIS_STATUS_LABELS: Record<AnalysisStatus, string> = {
  processing: "Em andamento",
  completed: "Concluída",
  reanalyzed: "Reanálise disponível",
};

export function fitLevelFromScore(score: number): FitLevel {
  if (score >= 85) return "Alta aderência";
  if (score >= 65) return "Boa aderência";
  if (score >= 40) return "Aderência parcial";
  return "Baixa aderência";
}
