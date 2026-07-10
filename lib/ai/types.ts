// Contrato da função generateCareerAnalysis.
// O mesmo shape é produzido pelo provider mock e pelo provider Anthropic.

export interface CareerAnalysisInput {
  user_id: string;
  analysis_id: string;
  resume_text: string | null;
  linkedin_text: string | null;
  linkedin_url: string | null;
  target_role: string;
  target_area: string | null;
  target_seniority: string | null;
  job_description_text: string | null;
  complementary_files_text: string | null;
  // Fase 2: jargões curados da área-alvo (tabela market_jargons),
  // injetados no prompt. Null quando a área não tem curadoria.
  market_terms: string[] | null;
  market_terms_note: string | null;
}

export interface AnalysisSummary {
  overall_score: number;
  general_diagnosis: string;
  main_strength: string;
  main_gap: string;
  next_best_action: string;
}

export interface AnalysisRecommendation {
  category: "competencia" | "comunicacao" | "evidencia" | "posicionamento";
  title: string;
  description: string;
  impact: "alto" | "medio" | "baixo";
  effort: "alto" | "medio" | "baixo";
  urgency: "alta" | "media" | "baixa";
  priority_order: number;
  suggested_action: string;
  reasoning: string;
  original_text: string | null;
  identified_issue: string | null;
  suggested_text: string | null;
  market_language_terms: string[];
  authenticity_warning: string | null;
}

export interface AnalysisFitDiagnostic {
  fit_type: "cargo_alvo" | "vaga_especifica";
  score: number;
  level: string;
  strengths: string[];
  gaps: string[];
  risks: string[];
  recommendation: string;
  reasoning: string;
}

export interface AnalysisEvolutionAction {
  action_title: string;
  action_description: string;
  action_type: string;
  priority: "alta" | "media" | "baixa";
  timeframe: string;
  success_criteria: string;
}

export interface CareerAnalysisResult {
  summary: AnalysisSummary;
  recommendations: AnalysisRecommendation[];
  fit_diagnostics: AnalysisFitDiagnostic[];
  evolution_plan: AnalysisEvolutionAction[];
}
