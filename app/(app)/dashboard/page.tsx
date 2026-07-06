import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ANALYSIS_STATUS_LABELS,
  type AnalysisStatus,
  type CareerAnalysis,
} from "@/lib/types";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function statusTone(status: AnalysisStatus) {
  switch (status) {
    case "completed":
      return "green" as const;
    case "reanalyzed":
      return "blue" as const;
    default:
      return "amber" as const;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: analyses }] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase
      .from("career_analyses")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const analysisIds = (analyses ?? []).map((a) => a.id);

  let pendingRecommendations = 0;
  let completedActions = 0;

  if (analysisIds.length > 0) {
    const [recsCount, actionsCount] = await Promise.all([
      supabase
        .from("recommendations")
        .select("id", { count: "exact", head: true })
        .in("analysis_id", analysisIds)
        .neq("status", "concluida"),
      supabase
        .from("evolution_plans")
        .select("id", { count: "exact", head: true })
        .in("analysis_id", analysisIds)
        .eq("status", "concluida"),
    ]);
    pendingRecommendations = recsCount.count ?? 0;
    completedActions = actionsCount.count ?? 0;
  }

  const list = (analyses ?? []) as CareerAnalysis[];
  const lastAnalysis = list[0];
  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "profissional";

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe suas análises e seu plano de evolução profissional.
          </p>
        </div>
        <ButtonLink href="/nova-analise">Nova análise</ButtonLink>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total de análises</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {list.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Última análise</p>
          <p className="mt-2 truncate text-lg font-semibold text-slate-900">
            {lastAnalysis ? formatDate(lastAnalysis.created_at) : "—"}
          </p>
          {lastAnalysis ? (
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {lastAnalysis.target_role}
            </p>
          ) : null}
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Recomendações pendentes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {pendingRecommendations}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Ações concluídas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {completedActions}
          </p>
        </Card>
      </div>

      {/* Lista de análises */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Suas análises
        </h2>

        {list.length === 0 ? (
          <EmptyState
            title="Você ainda não criou nenhuma análise"
            description="Comece enviando seu currículo, LinkedIn e cargo-alvo para receber seu primeiro diagnóstico."
            action={
              <ButtonLink href="/nova-analise">
                Criar primeira análise
              </ButtonLink>
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map((analysis) => (
              <Card key={analysis.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {analysis.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {analysis.target_role}
                      {analysis.job_company
                        ? ` · ${analysis.job_company}`
                        : analysis.job_title
                          ? ` · ${analysis.job_title}`
                          : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(analysis.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {analysis.overall_score !== null ? (
                      <span className="text-2xl font-semibold text-brand-700">
                        {analysis.overall_score}
                        <span className="text-sm font-normal text-slate-400">
                          /100
                        </span>
                      </span>
                    ) : null}
                    <Badge tone={statusTone(analysis.status)}>
                      {ANALYSIS_STATUS_LABELS[analysis.status]}
                    </Badge>
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/analise/${analysis.id}`}
                    className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100"
                  >
                    Ver resultado
                  </Link>
                  <Link
                    href={`/reanalise/${analysis.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Fazer reanálise
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
