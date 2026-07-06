"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FitDiagnostic } from "@/lib/types";

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "green" | "amber" | "red";
}) {
  const marker =
    tone === "green"
      ? "text-emerald-500"
      : tone === "amber"
        ? "text-amber-500"
        : "text-rose-500";

  if (!items || items.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
            <span className={`mt-1 text-xs ${marker}`}>●</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FitTab({ fits }: { fits: FitDiagnostic[] }) {
  if (fits.length === 0) {
    return (
      <EmptyState
        title="Diagnóstico de aderência indisponível"
        description="Esta análise ainda não possui diagnóstico gerado."
      />
    );
  }

  const ordered = [...fits].sort((a) =>
    a.fit_type === "cargo_alvo" ? -1 : 1
  );

  return (
    <div className="space-y-6">
      {ordered.map((fit) => (
        <Card key={fit.id}>
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <ScoreRing score={fit.score} label="aderência" />
              <Badge tone={fit.fit_type === "cargo_alvo" ? "brand" : "violet"}>
                {fit.fit_type === "cargo_alvo"
                  ? "Cargo-alvo"
                  : "Vaga específica"}
              </Badge>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {fit.level}
                  </h3>
                  <Badge tone="green">{fit.recommendation}</Badge>
                </div>
                {fit.reasoning ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {fit.reasoning}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                <ListBlock
                  title="Pontos fortes"
                  items={fit.strengths}
                  tone="green"
                />
                <ListBlock title="Lacunas" items={fit.gaps} tone="amber" />
                <ListBlock title="Riscos" items={fit.risks} tone="red" />
              </div>

              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
                Lacunas de <strong>comunicação</strong> e{" "}
                <strong>evidência</strong> podem ser resolvidas ajustando seus
                materiais. Lacunas <strong>reais</strong> pedem desenvolvimento
                de competência antes de aplicar.
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
