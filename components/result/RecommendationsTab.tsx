"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import {
  Badge,
  categoryTone,
  effortTone,
  impactTone,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  CATEGORY_LABELS,
  type Recommendation,
  type RecommendationCategory,
} from "@/lib/types";

const FILTERS: Array<{ value: RecommendationCategory | "todas"; label: string }> =
  [
    { value: "todas", label: "Todas" },
    { value: "posicionamento", label: "Posicionamento" },
    { value: "comunicacao", label: "Comunicação" },
    { value: "evidencia", label: "Evidência" },
    { value: "competencia", label: "Competência" },
  ];

export function RecommendationsTab({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<RecommendationCategory | "todas">(
    "todas"
  );
  const [items, setItems] = useState(recommendations);
  const [savingId, setSavingId] = useState<string | null>(null);

  const visible =
    filter === "todas"
      ? items
      : items.filter((rec) => rec.category === filter);

  async function toggleDone(rec: Recommendation) {
    const newStatus = rec.status === "concluida" ? "pendente" : "concluida";
    setSavingId(rec.id);

    const supabase = createClient();
    const { error } = await supabase
      .from("recommendations")
      .update({ status: newStatus })
      .eq("id", rec.id);

    setSavingId(null);

    if (error) {
      toast("Não foi possível atualizar. Tente novamente.", "error");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === rec.id ? { ...item, status: newStatus } : item
      )
    );
    toast(
      newStatus === "concluida"
        ? "Recomendação marcada como feita."
        : "Recomendação reaberta.",
      "success"
    );
  }

  async function copySuggestion(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Sugestão copiada.", "success");
    } catch {
      toast("Não foi possível copiar.", "error");
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nenhuma recomendação disponível"
        description="Esta análise ainda não possui recomendações geradas."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro por categoria */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === option.value
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Nenhuma recomendação nesta categoria" />
      ) : (
        visible.map((rec, index) => {
          const done = rec.status === "concluida";
          return (
            <Card
              key={rec.id}
              className={done ? "opacity-70 transition-opacity" : ""}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      #{rec.priority_order || index + 1}
                    </span>
                    <h3
                      className={`text-base font-semibold ${
                        done
                          ? "text-slate-500 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {rec.title}
                    </h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={categoryTone(rec.category)}>
                      {CATEGORY_LABELS[rec.category]}
                    </Badge>
                    <Badge tone={impactTone(rec.impact)}>
                      Impacto {rec.impact}
                    </Badge>
                    <Badge tone={effortTone(rec.effort)}>
                      Esforço {rec.effort}
                    </Badge>
                    <Badge tone={impactTone(rec.urgency)}>
                      Urgência {rec.urgency}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={done ? "outline" : "secondary"}
                  size="sm"
                  disabled={savingId === rec.id}
                  onClick={() => toggleDone(rec)}
                  className="shrink-0"
                >
                  {done ? "Desfazer" : "Marcar como feita"}
                </Button>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {rec.description}
              </p>

              {rec.suggested_action ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  <strong className="font-medium text-slate-800">
                    Ação sugerida:
                  </strong>{" "}
                  {rec.suggested_action}
                </p>
              ) : null}

              {rec.reasoning ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  <strong className="font-medium text-slate-600">
                    Por quê:
                  </strong>{" "}
                  {rec.reasoning}
                </p>
              ) : null}

              {/* Tradução contextual */}
              {rec.original_text || rec.suggested_text ? (
                <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tradução da experiência
                  </p>
                  {rec.original_text ? (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Texto original identificado
                      </p>
                      <p className="mt-1 rounded-md bg-white px-3 py-2 text-sm italic text-slate-600">
                        “{rec.original_text}”
                      </p>
                    </div>
                  ) : null}
                  {rec.identified_issue ? (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Problema identificado
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {rec.identified_issue}
                      </p>
                    </div>
                  ) : null}
                  {rec.suggested_text ? (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Versão sugerida
                      </p>
                      <p className="mt-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                        {rec.suggested_text}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copySuggestion(rec.suggested_text!)}
                      >
                        Copiar sugestão
                      </Button>
                    </div>
                  ) : null}
                  {rec.market_language_terms &&
                  rec.market_language_terms.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Termos de mercado relacionados
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {rec.market_language_terms.map((term) => (
                          <Badge key={term} tone="neutral">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {rec.authenticity_warning ? (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  ⚠ {rec.authenticity_warning}
                </p>
              ) : null}
            </Card>
          );
        })
      )}
    </div>
  );
}
