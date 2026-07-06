"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  CareerAnalysis,
  FitDiagnostic,
  Recommendation,
} from "@/lib/types";

export interface ComparisonData {
  previousScore: number | null;
  currentScore: number | null;
  previousTitle: string;
  completedRecommendations: number;
  improvementsSummary: string | null;
  remainingGaps: string | null;
}

export function OverviewTab({
  analysis,
  fits,
  recommendations,
  comparison,
}: {
  analysis: CareerAnalysis;
  fits: FitDiagnostic[];
  recommendations: Recommendation[];
  comparison: ComparisonData | null;
}) {
  const roleFit = fits.find((f) => f.fit_type === "cargo_alvo");
  const topRecommendations = recommendations.slice(0, 3);
  const scoreDelta =
    comparison &&
    comparison.previousScore !== null &&
    comparison.currentScore !== null
      ? comparison.currentScore - comparison.previousScore
      : null;

  return (
    <div className="space-y-6">
      {/* Comparativo de reanálise */}
      {comparison ? (
        <Card className="border-sky-200 bg-sky-50/50">
          <h3 className="text-base font-semibold text-slate-900">
            Comparativo com a análise anterior
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Em relação a: {comparison.previousTitle}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Score anterior → atual
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {comparison.previousScore ?? "—"}{" "}
                <span className="text-slate-400">→</span>{" "}
                {comparison.currentScore ?? "—"}
                {scoreDelta !== null ? (
                  <span
                    className={`ml-2 text-sm font-medium ${
                      scoreDelta > 0
                        ? "text-emerald-600"
                        : scoreDelta < 0
                          ? "text-rose-600"
                          : "text-slate-400"
                    }`}
                  >
                    {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Recomendações concluídas
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {comparison.completedRecommendations}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Melhorias percebidas
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {comparison.improvementsSummary ?? "—"}
              </p>
            </div>
          </div>
          {comparison.remainingGaps ? (
            <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-slate-600">
              <strong className="text-amber-700">
                Lacunas que continuam abertas:
              </strong>{" "}
              {comparison.remainingGaps}
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* Diagnóstico geral */}
      <Card>
        <h3 className="text-base font-semibold text-slate-900">
          Diagnóstico geral
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {analysis.summary ?? "Diagnóstico não disponível."}
        </p>
        {roleFit ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{roleFit.level}</Badge>
            <Badge tone="neutral">
              Recomendação: {roleFit.recommendation}
            </Badge>
          </div>
        ) : null}
      </Card>

      {/* O que ajustar primeiro */}
      <Card>
        <h3 className="text-base font-semibold text-slate-900">
          O que ajustar primeiro
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          As três recomendações de maior prioridade. Veja a lista completa na
          aba “Recomendações e tradução”.
        </p>
        <ol className="mt-4 space-y-3">
          {topRecommendations.map((rec, index) => (
            <li
              key={rec.id}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {rec.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Impacto {rec.impact} · esforço {rec.effort} · urgência{" "}
                  {rec.urgency}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
