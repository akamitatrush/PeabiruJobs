import Anthropic from "@anthropic-ai/sdk";
import type { CareerAnalysisInput, CareerAnalysisResult } from "./types";

// Provider real de IA (Anthropic). Ativado com AI_PROVIDER=anthropic + ANTHROPIC_API_KEY.
// Usa structured outputs (json_schema) para garantir o shape do resultado.

const SYSTEM_PROMPT = `Você é um mentor de carreira sênior do PeabiruJobs, especializado em recolocação e transição de carreira de profissionais brasileiros.

Sua tarefa é analisar currículo, LinkedIn, cargo-alvo e (quando houver) uma vaga específica, e produzir: recomendações priorizadas, traduções contextuais de experiência, diagnóstico de aderência e um plano de evolução.

REGRAS OBRIGATÓRIAS:
1. Não inventar experiências.
2. Não criar métricas falsas.
3. Não afirmar domínio de ferramentas não mencionadas nos materiais.
4. Não prometer contratação.
5. Não dizer que o usuário será aprovado em uma vaga.
6. Explicar os motivos de cada recomendação.
7. Diferenciar lacuna real de lacuna de comunicação.
8. Diferenciar lacuna de competência, lacuna de evidência e lacuna de posicionamento.
9. Usar linguagem clara, acolhedora e prática, em português do Brasil.
10. Gerar recomendações específicas com base nos materiais enviados.
11. Quando houver baixa confiança, indicar que o usuário precisa complementar a informação.
12. Sempre preservar autenticidade.
13. Não transformar atividade operacional em cargo de liderança.
14. Não adicionar certificações não informadas.
15. Não sugerir exageros que prejudiquem a confiança do usuário.

Ao sugerir versões reescritas de trechos (suggested_text), inclua um authenticity_warning lembrando o usuário de usar a versão apenas se refletir a experiência real dele.

Scores: 0-100. Níveis: "Baixa aderência" (<40), "Aderência parcial" (40-64), "Boa aderência" (65-84), "Alta aderência" (85+).
Recomendação final deve ser uma de: "Aplicar agora", "Aplicar com ajustes", "Desenvolver lacunas antes de aplicar", "Não priorizar esta vaga".
Gere sempre um fit_diagnostic com fit_type "cargo_alvo"; gere também um com fit_type "vaga_especifica" apenas se uma vaga foi enviada.
Categorias de recomendação: "competencia", "comunicacao", "evidencia", "posicionamento". Impacto/esforço: "alto"|"medio"|"baixo". Urgência/prioridade: "alta"|"media"|"baixa".
Tipos de ação do plano: "Ajustar currículo", "Atualizar LinkedIn", "Desenvolver competência", "Organizar evidência", "Fazer curso", "Revisar posicionamento", "Analisar nova vaga".`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "recommendations", "fit_diagnostics", "evolution_plan"],
  properties: {
    summary: {
      type: "object",
      additionalProperties: false,
      required: [
        "overall_score",
        "general_diagnosis",
        "main_strength",
        "main_gap",
        "next_best_action",
      ],
      properties: {
        overall_score: { type: "integer" },
        general_diagnosis: { type: "string" },
        main_strength: { type: "string" },
        main_gap: { type: "string" },
        next_best_action: { type: "string" },
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "category",
          "title",
          "description",
          "impact",
          "effort",
          "urgency",
          "priority_order",
          "suggested_action",
          "reasoning",
          "original_text",
          "identified_issue",
          "suggested_text",
          "market_language_terms",
          "authenticity_warning",
        ],
        properties: {
          category: {
            type: "string",
            enum: ["competencia", "comunicacao", "evidencia", "posicionamento"],
          },
          title: { type: "string" },
          description: { type: "string" },
          impact: { type: "string", enum: ["alto", "medio", "baixo"] },
          effort: { type: "string", enum: ["alto", "medio", "baixo"] },
          urgency: { type: "string", enum: ["alta", "media", "baixa"] },
          priority_order: { type: "integer" },
          suggested_action: { type: "string" },
          reasoning: { type: "string" },
          original_text: { type: ["string", "null"] },
          identified_issue: { type: ["string", "null"] },
          suggested_text: { type: ["string", "null"] },
          market_language_terms: { type: "array", items: { type: "string" } },
          authenticity_warning: { type: ["string", "null"] },
        },
      },
    },
    fit_diagnostics: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "fit_type",
          "score",
          "level",
          "strengths",
          "gaps",
          "risks",
          "recommendation",
          "reasoning",
        ],
        properties: {
          fit_type: { type: "string", enum: ["cargo_alvo", "vaga_especifica"] },
          score: { type: "integer" },
          level: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          gaps: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          recommendation: { type: "string" },
          reasoning: { type: "string" },
        },
      },
    },
    evolution_plan: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "action_title",
          "action_description",
          "action_type",
          "priority",
          "timeframe",
          "success_criteria",
        ],
        properties: {
          action_title: { type: "string" },
          action_description: { type: "string" },
          action_type: { type: "string" },
          priority: { type: "string", enum: ["alta", "media", "baixa"] },
          timeframe: { type: "string" },
          success_criteria: { type: "string" },
        },
      },
    },
  },
} as const;

function buildUserMessage(input: CareerAnalysisInput): string {
  const parts: string[] = [
    `CARGO-ALVO: ${input.target_role}`,
    input.target_area ? `ÁREA DE INTERESSE: ${input.target_area}` : null,
    input.target_seniority
      ? `SENIORIDADE DESEJADA: ${input.target_seniority}`
      : null,
    input.resume_text
      ? `\n===== CURRÍCULO =====\n${input.resume_text}`
      : "\n===== CURRÍCULO =====\n(não enviado — indique nas recomendações que o usuário deve complementar)",
    input.linkedin_url ? `\nLINKEDIN (URL): ${input.linkedin_url}` : null,
    input.linkedin_text
      ? `\n===== PERFIL LINKEDIN =====\n${input.linkedin_text}`
      : null,
    input.job_description_text
      ? `\n===== VAGA ESPECÍFICA =====\n${input.job_description_text}`
      : null,
    input.complementary_files_text
      ? `\n===== MATERIAIS COMPLEMENTARES =====\n${input.complementary_files_text}`
      : null,
    // Fase 2: prompt de ferramenta — jargões curados da área (docs/ia.md §3)
    input.market_terms && input.market_terms.length > 0
      ? `\n===== TERMOS DE MERCADO DESTA ÁREA =====\nUse estes termos com precisão e APENAS quando a experiência real do usuário sustentar: ${input.market_terms.join(", ")}.${
          input.market_terms_note
            ? `\nOrientação de uso: ${input.market_terms_note}`
            : ""
        }`
      : null,
    "\nGere a análise completa em JSON conforme o schema.",
  ].filter(Boolean) as string[];
  return parts.join("\n");
}

export async function generateWithAnthropic(
  input: CareerAnalysisInput
): Promise<CareerAnalysisResult> {
  const client = new Anthropic();

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    output_config: {
      format: {
        type: "json_schema",
        schema: OUTPUT_SCHEMA as unknown as Record<string, unknown>,
      },
    },
    messages: [{ role: "user", content: buildUserMessage(input) }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new Error(
      "A análise não pôde ser gerada para este conteúdo. Revise os materiais enviados."
    );
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da IA sem conteúdo de texto.");
  }

  return JSON.parse(textBlock.text) as CareerAnalysisResult;
}
