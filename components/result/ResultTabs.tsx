"use client";

import { Tabs } from "@/components/ui/Tabs";
import type {
  CareerAnalysis,
  EvolutionPlanAction,
  FitDiagnostic,
  Recommendation,
} from "@/lib/types";
import { OverviewTab, type ComparisonData } from "./OverviewTab";
import { RecommendationsTab } from "./RecommendationsTab";
import { FitTab } from "./FitTab";
import { PlanTab } from "./PlanTab";

export function ResultTabs({
  analysis,
  recommendations,
  fits,
  plan,
  comparison,
}: {
  analysis: CareerAnalysis;
  recommendations: Recommendation[];
  fits: FitDiagnostic[];
  plan: EvolutionPlanAction[];
  comparison: ComparisonData | null;
}) {
  return (
    <Tabs
      tabs={[
        {
          id: "overview",
          label: "Visão geral",
          content: (
            <OverviewTab
              analysis={analysis}
              fits={fits}
              recommendations={recommendations}
              comparison={comparison}
            />
          ),
        },
        {
          id: "recommendations",
          label: "Recomendações e tradução",
          content: <RecommendationsTab recommendations={recommendations} />,
        },
        {
          id: "fit",
          label: "Aderência",
          content: <FitTab fits={fits} />,
        },
        {
          id: "plan",
          label: "Plano de evolução",
          content: <PlanTab plan={plan} />,
        },
      ]}
    />
  );
}
