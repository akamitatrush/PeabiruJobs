"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Badge, impactTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { STATUS_LABELS, type EvolutionPlanAction } from "@/lib/types";

export function PlanTab({ plan }: { plan: EvolutionPlanAction[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(plan);
  const [savingId, setSavingId] = useState<string | null>(null);

  const completed = items.filter((a) => a.status === "concluida").length;

  async function updateStatus(
    action: EvolutionPlanAction,
    newStatus: EvolutionPlanAction["status"]
  ) {
    setSavingId(action.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("evolution_plans")
      .update({ status: newStatus })
      .eq("id", action.id);
    setSavingId(null);

    if (error) {
      toast("Não foi possível atualizar. Tente novamente.", "error");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === action.id ? { ...item, status: newStatus } : item
      )
    );
    if (newStatus === "concluida") {
      toast("Ação concluída. Bom progresso!", "success");
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Plano de evolução indisponível"
        description="Esta análise ainda não possui plano gerado."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Progresso do plano */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Progresso do plano
          </h3>
          <span className="text-sm text-slate-500">
            {completed} de {items.length} ações concluídas
          </span>
        </div>
        <ProgressBar
          value={completed}
          max={items.length}
          className="mt-3"
        />
        {completed === items.length ? (
          <p className="mt-3 text-sm text-emerald-700">
            Plano concluído! Este é um ótimo momento para fazer uma reanálise
            e medir sua evolução.
          </p>
        ) : null}
      </Card>

      {items.map((action) => {
        const done = action.status === "concluida";
        return (
          <Card key={action.id} className={done ? "opacity-70" : ""}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3
                  className={`text-base font-semibold ${
                    done ? "text-slate-500 line-through" : "text-slate-900"
                  }`}
                >
                  {action.action_title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="brand">{action.action_type}</Badge>
                  <Badge tone={impactTone(action.priority)}>
                    Prioridade {action.priority}
                  </Badge>
                  {action.timeframe ? (
                    <Badge tone="neutral">Prazo: {action.timeframe}</Badge>
                  ) : null}
                  <Badge tone={done ? "green" : "amber"}>
                    {STATUS_LABELS[action.status]}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {!done && action.status === "pendente" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={savingId === action.id}
                    onClick={() => updateStatus(action, "em_andamento")}
                  >
                    Iniciar
                  </Button>
                ) : null}
                <Button
                  variant={done ? "outline" : "secondary"}
                  size="sm"
                  disabled={savingId === action.id}
                  onClick={() =>
                    updateStatus(action, done ? "pendente" : "concluida")
                  }
                >
                  {done ? "Reabrir" : "Marcar como concluída"}
                </Button>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {action.action_description}
            </p>

            {action.success_criteria ? (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <strong className="font-medium text-slate-700">
                  Critério de sucesso:
                </strong>{" "}
                {action.success_criteria}
              </p>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
