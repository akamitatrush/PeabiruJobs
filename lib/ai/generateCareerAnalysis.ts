import type { CareerAnalysisInput, CareerAnalysisResult } from "./types";
import { generateMockAnalysis } from "./mock";

// Ponto único de geração de análise.
// AI_PROVIDER=mock (padrão)  → dados simulados realistas, sem custo.
// AI_PROVIDER=anthropic      → API da Anthropic (requer ANTHROPIC_API_KEY).
export async function generateCareerAnalysis(
  input: CareerAnalysisInput
): Promise<CareerAnalysisResult> {
  const provider = process.env.AI_PROVIDER ?? "mock";

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    const { generateWithAnthropic } = await import("./anthropic");
    try {
      return await generateWithAnthropic(input);
    } catch (error) {
      console.error(
        "Falha no provider Anthropic; usando análise simulada:",
        error
      );
      return generateMockAnalysis(input);
    }
  }

  return generateMockAnalysis(input);
}

export type { CareerAnalysisInput, CareerAnalysisResult };
