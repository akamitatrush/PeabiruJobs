import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ResultTabs } from "@/components/result/ResultTabs";
import {
  ANALYSIS_STATUS_LABELS,
  type CareerAnalysis,
  type EvolutionPlanAction,
  type FitDiagnostic,
  type Recommendation,
} from "@/lib/types";

export const metadata = { title: "Resultado da análise" };
export const dynamic = "force-dynamic";

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: analysis } = await supabase
    .from("career_analyses")
    .select("*")
    .eq("id", id)
    .maybeSingle<CareerAnalysis>();

  if (!analysis) {
    notFound();
  }

  const [recsRes, fitsRes, planRes, versionRes] = await Promise.all([
    supabase
      .from("recommendations")
      .select("*")
      .eq("analysis_id", id)
      .order("priority_order", { ascending: true }),
    supabase
      .from("fit_diagnostics")
      .select("*")
      .eq("analysis_id", id)
      .order("fit_type", { ascending: true }),
    supabase
      .from("evolution_plans")
      .select("*")
      .eq("analysis_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("analysis_versions")
      .select("*")
      .eq("new_analysis_id", id)
      .maybeSingle(),
  ]);

  const recommendations = (recsRes.data ?? []) as Recommendation[];
  const fits = (fitsRes.data ?? []) as FitDiagnostic[];
  const plan = (planRes.data ?? []) as EvolutionPlanAction[];
  const version = versionRes.data;

  // Dados do comparativo (quando esta análise é uma reanálise)
  let comparison: {
    previousScore: number | null;
    currentScore: number | null;
    previousTitle: string;
    completedRecommendations: number;
    improvementsSummary: string | null;
    remainingGaps: string | null;
  } | null = null;

  if (version) {
    const [{ data: original }, completedRecs] = await Promise.all([
      supabase
        .from("career_analyses")
        .select("title, overall_score")
        .eq("id", version.original_analysis_id)
        .maybeSingle(),
      supabase
        .from("recommendations")
        .select("id", { count: "exact", head: true })
        .eq("analysis_id", version.original_analysis_id)
        .eq("status", "concluida"),
    ]);

    comparison = {
      previousScore: original?.overall_score ?? null,
      currentScore: analysis.overall_score,
      previousTitle: original?.title ?? "Análise anterior",
      completedRecommendations: completedRecs.count ?? 0,
      improvementsSummary: version.improvements_summary,
      remainingGaps: version.remaining_gaps,
    };
  }

  const formattedDate = new Date(analysis.created_at).toLocaleDateString(
    "pt-BR",
    { day: "2-digit", month: "long", year: "numeric" }
  );

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {analysis.title}
            </h1>
            <Badge
              tone={analysis.status === "completed" ? "green" : "blue"}
            >
              {ANALYSIS_STATUS_LABELS[analysis.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {analysis.target_role}
            {analysis.job_company ? ` · ${analysis.job_company}` : ""} ·{" "}
            {formattedDate}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <ButtonLink href="/nova-analise" variant="outline">
            Nova análise
          </ButtonLink>
          <ButtonLink href={`/reanalise/${analysis.id}`}>
            Fazer reanálise
          </ButtonLink>
        </div>
      </div>

      {/* Resumo executivo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center justify-center p-5">
          <ScoreRing score={analysis.overall_score ?? 0} label="score geral" />
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
            Principal ponto forte
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {analysis.main_strength ?? "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Principal lacuna
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {analysis.main_gap ?? "—"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Próxima ação recomendada
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {analysis.next_best_action ?? "—"}
          </p>
        </Card>
      </div>

      {/* Abas */}
      <ResultTabs
        analysis={analysis}
        recommendations={recommendations}
        fits={fits}
        plan={plan}
        comparison={comparison}
      />
    </div>
  );
}
