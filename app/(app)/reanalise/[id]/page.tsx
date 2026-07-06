import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnalysisWizard } from "@/components/wizard/AnalysisWizard";

export const metadata = { title: "Reanálise" };

export default async function ReanalisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: analysis } = await supabase
    .from("career_analyses")
    .select("id, title, target_role, target_area, target_seniority")
    .eq("id", id)
    .maybeSingle();

  if (!analysis) {
    notFound();
  }

  return (
    <div>
      <p className="mx-auto mb-6 max-w-2xl rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
        Você está fazendo uma reanálise a partir de{" "}
        <strong>{analysis.title}</strong>. Envie os materiais atualizados —
        ao final, mostraremos o comparativo com a análise anterior.
      </p>
      <AnalysisWizard
        initial={{
          originalAnalysisId: analysis.id,
          targetRole: analysis.target_role,
          targetArea: analysis.target_area,
          targetSeniority: analysis.target_seniority,
        }}
      />
    </div>
  );
}
