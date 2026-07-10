import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCareerAnalysis } from "@/lib/ai/generateCareerAnalysis";
import { matchJargons, type JargonRow } from "@/lib/ai/jargons";
import type { DocumentType } from "@/lib/types";

export const maxDuration = 60;

interface DocumentPayload {
  document_type: DocumentType;
  file_url?: string | null;
  raw_text?: string | null;
}

interface CreateAnalysisPayload {
  title?: string;
  target_role: string;
  target_area?: string | null;
  target_seniority?: string | null;
  resume_text?: string | null;
  linkedin_url?: string | null;
  linkedin_text?: string | null;
  job_description_text?: string | null;
  job_title?: string | null;
  job_company?: string | null;
  complementary_files_text?: string | null;
  documents?: DocumentPayload[];
  original_analysis_id?: string | null;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  let payload: CreateAnalysisPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!payload.target_role?.trim()) {
    return NextResponse.json(
      { error: "Informe o cargo-alvo da análise." },
      { status: 400 }
    );
  }

  // 1. Cria a análise em processamento
  const { data: analysis, error: insertError } = await supabase
    .from("career_analyses")
    .insert({
      user_id: user.id,
      title:
        payload.title?.trim() ||
        `Análise — ${payload.target_role.trim()}`,
      target_role: payload.target_role.trim(),
      target_area: payload.target_area?.trim() || null,
      target_seniority: payload.target_seniority?.trim() || null,
      job_title: payload.job_title?.trim() || null,
      job_company: payload.job_company?.trim() || null,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !analysis) {
    console.error("Erro ao criar análise:", insertError);
    return NextResponse.json(
      { error: "Não foi possível criar a análise." },
      { status: 500 }
    );
  }

  // 2. Salva os documentos vinculados
  const documents: DocumentPayload[] = [
    payload.resume_text
      ? { document_type: "resume" as const, raw_text: payload.resume_text }
      : null,
    payload.linkedin_url
      ? {
          document_type: "linkedin_url" as const,
          file_url: payload.linkedin_url,
        }
      : null,
    payload.linkedin_text
      ? {
          document_type: "pasted_text" as const,
          raw_text: payload.linkedin_text,
        }
      : null,
    payload.job_description_text
      ? {
          document_type: "job_description" as const,
          raw_text: payload.job_description_text,
        }
      : null,
    ...(payload.documents ?? []),
  ].filter(Boolean) as DocumentPayload[];

  if (documents.length > 0) {
    const { error: docsError } = await supabase.from("user_documents").insert(
      documents.map((doc) => ({
        user_id: user.id,
        analysis_id: analysis.id,
        document_type: doc.document_type,
        file_url: doc.file_url ?? null,
        raw_text: doc.raw_text ?? null,
      }))
    );
    if (docsError) {
      console.error("Erro ao salvar documentos:", docsError);
    }
  }

  // 3. Fase 2 da IA: consulta os jargões curados da área-alvo.
  // Fallback silencioso: sem tabela ou sem área correspondente, segue sem termos.
  let jargons: JargonRow | null = null;
  const { data: jargonRows, error: jargonsError } = await supabase
    .from("market_jargons")
    .select("area, keywords, terms, usage_note");
  if (!jargonsError) {
    jargons = matchJargons(
      jargonRows as JargonRow[] | null,
      payload.target_area ?? null,
      payload.target_role
    );
  }

  // 4. Gera a análise (mock ou IA real, conforme AI_PROVIDER)
  try {
    const result = await generateCareerAnalysis({
      user_id: user.id,
      analysis_id: analysis.id,
      resume_text: payload.resume_text ?? null,
      linkedin_text: payload.linkedin_text ?? null,
      linkedin_url: payload.linkedin_url ?? null,
      target_role: payload.target_role,
      target_area: payload.target_area ?? null,
      target_seniority: payload.target_seniority ?? null,
      job_description_text: payload.job_description_text ?? null,
      complementary_files_text: payload.complementary_files_text ?? null,
      market_terms: jargons?.terms ?? null,
      market_terms_note: jargons?.usage_note ?? null,
    });

    // 5. Persiste recomendações, diagnósticos e plano
    const [recsResult, fitsResult, planResult] = await Promise.all([
      supabase.from("recommendations").insert(
        result.recommendations.map((rec) => ({
          analysis_id: analysis.id,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          effort: rec.effort,
          urgency: rec.urgency,
          priority_order: rec.priority_order,
          suggested_action: rec.suggested_action,
          reasoning: rec.reasoning,
          original_text: rec.original_text,
          identified_issue: rec.identified_issue,
          suggested_text: rec.suggested_text,
          market_language_terms: rec.market_language_terms,
          authenticity_warning: rec.authenticity_warning,
          status: "pendente",
        }))
      ),
      supabase.from("fit_diagnostics").insert(
        result.fit_diagnostics.map((fit) => ({
          analysis_id: analysis.id,
          fit_type: fit.fit_type,
          score: fit.score,
          level: fit.level,
          strengths: fit.strengths,
          gaps: fit.gaps,
          risks: fit.risks,
          recommendation: fit.recommendation,
          reasoning: fit.reasoning,
        }))
      ),
      supabase.from("evolution_plans").insert(
        result.evolution_plan.map((action) => ({
          analysis_id: analysis.id,
          action_title: action.action_title,
          action_description: action.action_description,
          action_type: action.action_type,
          priority: action.priority,
          timeframe: action.timeframe,
          success_criteria: action.success_criteria,
          status: "pendente",
        }))
      ),
    ]);

    const childError =
      recsResult.error ?? fitsResult.error ?? planResult.error;
    if (childError) {
      throw childError;
    }

    // 6. Atualiza a análise com o resumo executivo
    const { error: updateError } = await supabase
      .from("career_analyses")
      .update({
        status: "completed",
        overall_score: result.summary.overall_score,
        summary: result.summary.general_diagnosis,
        main_strength: result.summary.main_strength,
        main_gap: result.summary.main_gap,
        next_best_action: result.summary.next_best_action,
      })
      .eq("id", analysis.id);

    if (updateError) throw updateError;

    // 7. Reanálise: registra o vínculo e o comparativo com a análise original
    if (payload.original_analysis_id) {
      const { data: original } = await supabase
        .from("career_analyses")
        .select("id, overall_score, main_gap")
        .eq("id", payload.original_analysis_id)
        .single();

      if (original) {
        const scoreChange =
          result.summary.overall_score - (original.overall_score ?? 0);

        await supabase.from("analysis_versions").insert({
          original_analysis_id: original.id,
          new_analysis_id: analysis.id,
          user_id: user.id,
          improvements_summary:
            scoreChange > 0
              ? `Score evoluiu ${scoreChange} ponto(s) em relação à análise anterior.`
              : scoreChange === 0
                ? "Score manteve-se estável em relação à análise anterior."
                : `Score reduziu ${Math.abs(scoreChange)} ponto(s) — revise se os novos materiais refletem todos os ajustes feitos.`,
          remaining_gaps: result.summary.main_gap,
          score_change: scoreChange,
        });

        await supabase
          .from("career_analyses")
          .update({ status: "reanalyzed" })
          .eq("id", original.id);
      }
    }

    return NextResponse.json({ id: analysis.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao gerar análise:", error);
    // Mantém a análise marcada como em processamento com falha visível
    await supabase
      .from("career_analyses")
      .update({ summary: "Falha ao gerar a análise. Tente novamente." })
      .eq("id", analysis.id);

    return NextResponse.json(
      { error: "Falha ao gerar a análise. Tente novamente." },
      { status: 500 }
    );
  }
}
