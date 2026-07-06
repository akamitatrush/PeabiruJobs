import { fitLevelFromScore } from "@/lib/types";
import type {
  CareerAnalysisInput,
  CareerAnalysisResult,
  AnalysisRecommendation,
  AnalysisFitDiagnostic,
} from "./types";

// Provider simulado: gera uma análise realista e determinística a partir
// dos materiais enviados, respeitando as regras de autenticidade do produto
// (não inventa experiências, métricas ou ferramentas).

function extractSnippet(text: string | null, maxLen = 140): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length < 30) return null;
  // Pega uma frase do meio do texto para servir de "trecho identificado".
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 25);
  const pick = sentences[Math.floor(sentences.length / 2)] ?? sentences[0];
  if (!pick) return null;
  return pick.length > maxLen ? pick.slice(0, maxLen).trim() + "…" : pick;
}

// Score pseudo-determinístico: mais materiais → score-base maior,
// sem aleatoriedade (mesma entrada, mesma saída).
function baseScore(input: CareerAnalysisInput): number {
  let score = 55;
  if (input.resume_text && input.resume_text.length > 200) score += 8;
  if (input.linkedin_text || input.linkedin_url) score += 6;
  if (input.target_area) score += 3;
  if (input.target_seniority) score += 3;
  if (input.complementary_files_text) score += 4;
  const seed =
    (input.resume_text?.length ?? 0) + (input.target_role?.length ?? 0);
  return Math.min(88, score + (seed % 7));
}

export function generateMockAnalysis(
  input: CareerAnalysisInput
): CareerAnalysisResult {
  const role = input.target_role || "seu cargo-alvo";
  const score = baseScore(input);
  const hasJob = Boolean(input.job_description_text);
  const hasLinkedin = Boolean(input.linkedin_text || input.linkedin_url);
  const resumeSnippet = extractSnippet(input.resume_text);

  const recommendations: AnalysisRecommendation[] = [
    {
      category: "posicionamento",
      title: "Ajustar título profissional do LinkedIn",
      description: hasLinkedin
        ? `Seu LinkedIn não comunica com clareza sua área de atuação, principais competências e o cargo desejado (${role}). Recrutadores decidem em segundos se o perfil é relevante.`
        : `Você ainda não informou um LinkedIn completo. Um título profissional específico é um dos ajustes de maior impacto para aparecer em buscas de recrutadores para ${role}.`,
      impact: "alto",
      effort: "baixo",
      urgency: "alta",
      priority_order: 1,
      suggested_action: `Atualizar o título para algo específico, como: "${role} | principais competências | área de atuação".`,
      reasoning:
        "Um título específico ajuda recrutadores e sistemas de busca a entenderem rapidamente seu posicionamento profissional.",
      original_text: null,
      identified_issue: null,
      suggested_text: null,
      market_language_terms: ["headline", "posicionamento", "palavras-chave"],
      authenticity_warning: null,
    },
    {
      category: "comunicacao",
      title: "Traduzir descrições genéricas de experiência",
      description:
        "Algumas descrições das suas experiências estão genéricas: não mostram quais demandas eram apoiadas, quais ferramentas eram usadas ou qual era o impacto da sua atuação.",
      impact: "alto",
      effort: "medio",
      urgency: "alta",
      priority_order: 2,
      suggested_action:
        "Reescrever as principais experiências detalhando atividades reais, ferramentas utilizadas e resultados observáveis — sem inventar nada.",
      reasoning:
        "Descrições específicas comunicam competências que você já tem, mas que hoje ficam invisíveis para quem lê. Esta é uma lacuna de comunicação, não de competência.",
      original_text: resumeSnippet ?? "Ajudava a equipe no dia a dia.",
      identified_issue:
        "A descrição está genérica e não evidencia demandas apoiadas, ferramentas usadas ou impacto da atuação.",
      suggested_text:
        "Apoio às rotinas operacionais da equipe, contribuindo para a organização de demandas, controle de informações e execução de atividades administrativas do dia a dia.",
      market_language_terms: [
        "apoio operacional",
        "organização de demandas",
        "gestão de rotina",
      ],
      authenticity_warning:
        "Use esta versão apenas se essas atividades realmente fizeram parte da sua experiência.",
    },
    {
      category: "evidencia",
      title: "Adicionar evidências concretas de impacto",
      description:
        "Seu currículo lista responsabilidades, mas traz poucas evidências de resultado: números, entregas, aprendizados ou reconhecimentos que sustentem o que você afirma.",
      impact: "alto",
      effort: "medio",
      urgency: "media",
      priority_order: 3,
      suggested_action:
        "Incluir 2 a 3 evidências reais por experiência relevante: volumes tratados, prazos cumpridos, melhorias percebidas ou feedbacks recebidos.",
      reasoning:
        "Evidências reais diferenciam candidatos com trajetórias parecidas. Só inclua o que você consegue sustentar em entrevista — métricas inventadas destroem confiança.",
      original_text: null,
      identified_issue: null,
      suggested_text: null,
      market_language_terms: ["resultados", "indicadores", "entregas"],
      authenticity_warning:
        "Não crie métricas que você não consegue comprovar. Evidências qualitativas reais valem mais do que números falsos.",
    },
    {
      category: "competencia",
      title: hasJob
        ? "Mapear requisitos da vaga que ainda não aparecem no seu material"
        : `Mapear competências esperadas para ${role}`,
      description: hasJob
        ? "A vaga menciona requisitos que não aparecem no seu currículo nem no LinkedIn. Antes de aplicar, identifique quais você já tem (e precisa comunicar) e quais são lacunas reais."
        : `Cargos de ${role} costumam esperar um conjunto de competências que você deve mapear: quais você já tem e estão mal comunicadas, e quais precisa desenvolver.`,
      impact: "medio",
      effort: "alto",
      urgency: "media",
      priority_order: 4,
      suggested_action:
        "Listar os requisitos do cargo em duas colunas: 'já tenho, preciso comunicar' e 'preciso desenvolver'. Atualizar materiais para a primeira e planejar ações para a segunda.",
      reasoning:
        "Diferenciar lacuna real de lacuna de comunicação evita que você estude o que já sabe ou aplique sem preparo para o que ainda falta.",
      original_text: null,
      identified_issue: null,
      suggested_text: null,
      market_language_terms: ["hard skills", "requisitos", "gap de competência"],
      authenticity_warning: null,
    },
    {
      category: "posicionamento",
      title: "Alinhar resumo profissional ao cargo-alvo",
      description: `O resumo (currículo e LinkedIn) deve contar em 3 a 5 linhas quem você é profissionalmente, o que sabe fazer e para onde quer ir (${role}). Hoje essa narrativa não está clara.`,
      impact: "medio",
      effort: "baixo",
      urgency: "media",
      priority_order: 5,
      suggested_action: `Escrever um resumo curto conectando sua experiência real às demandas típicas de ${role}, citando suas competências mais fortes.`,
      reasoning:
        "O resumo é a primeira leitura do recrutador. Uma narrativa clara aumenta a chance de o restante do material ser lido com atenção.",
      original_text: null,
      identified_issue: null,
      suggested_text: null,
      market_language_terms: ["resumo profissional", "sobre", "narrativa"],
      authenticity_warning: null,
    },
  ];

  const fitDiagnostics: AnalysisFitDiagnostic[] = [
    {
      fit_type: "cargo_alvo",
      score,
      level: fitLevelFromScore(score),
      strengths: [
        "Trajetória com experiências relacionadas às demandas do cargo",
        "Competências de base presentes nos materiais enviados",
        input.target_seniority
          ? `Senioridade desejada (${input.target_seniority}) coerente com a trajetória descrita`
          : "Percurso profissional com progressão identificável",
      ],
      gaps: [
        "Lacuna de comunicação: competências existentes pouco evidentes nos materiais",
        "Lacuna de evidência: poucas provas concretas de impacto e resultado",
        hasLinkedin
          ? "Posicionamento do LinkedIn não direcionado ao cargo-alvo"
          : "Ausência de LinkedIn estruturado reduz visibilidade para recrutadores",
      ],
      risks: [
        "Concorrer com candidatos que comunicam melhor trajetórias equivalentes",
      ],
      recommendation:
        score >= 75 ? "Aplicar com ajustes" : "Desenvolver lacunas antes de aplicar",
      reasoning: `Seu perfil tem compatibilidade com cargos de ${role}, mas os materiais atuais comunicam menos do que sua experiência real sugere. A maior parte das lacunas identificadas é de comunicação e evidência, não de competência.`,
    },
  ];

  if (hasJob) {
    const jobScore = Math.max(35, Math.min(92, score + 2));
    fitDiagnostics.push({
      fit_type: "vaga_especifica",
      score: jobScore,
      level: fitLevelFromScore(jobScore),
      strengths: [
        "Experiências anteriores relacionadas aos requisitos principais da vaga",
        "Competências de base aderentes ao que a vaga descreve como obrigatório",
      ],
      gaps: [
        "Lacuna de comunicação: requisitos que você atende, mas não menciona nos materiais",
        "Lacuna de evidência: requisitos citados sem comprovação de prática",
        "Lacuna real: requisitos desejáveis ainda não desenvolvidos",
      ],
      risks: [
        "Alguns requisitos da vaga podem estar inflados — nem todos são eliminatórios",
        "Aplicar sem ajustar os materiais reduz a chance de passar pela triagem inicial",
      ],
      recommendation: jobScore >= 75 ? "Aplicar com ajustes" : "Aplicar com ajustes",
      reasoning:
        "A vaga tem boa relação com seu perfil. Antes de aplicar, atualize currículo e LinkedIn para evidenciar os requisitos que você já atende e prepare-se para explicar as lacunas reais em entrevista.",
    });
  }

  return {
    summary: {
      overall_score: score,
      general_diagnosis: `Seu perfil tem ${fitLevelFromScore(score).toLowerCase()} com cargos de ${role}. As principais oportunidades de melhoria estão na comunicação da sua experiência real — descrições mais específicas, evidências de impacto e posicionamento direcionado — e não em falta de competência.`,
      main_strength:
        "Trajetória real com experiências aproveitáveis para o cargo-alvo",
      main_gap:
        "Comunicação genérica: competências existentes ficam invisíveis nos materiais",
      next_best_action:
        "Ajustar o título e o resumo do LinkedIn para o cargo-alvo (alto impacto, baixo esforço)",
    },
    recommendations,
    fit_diagnostics: fitDiagnostics,
    evolution_plan: [
      {
        action_title: "Atualizar título e resumo do LinkedIn",
        action_description: `Reescrever headline e seção "Sobre" direcionando para ${role}, com competências reais e área de atuação.`,
        action_type: "Atualizar LinkedIn",
        priority: "alta",
        timeframe: "3 dias",
        success_criteria:
          "LinkedIn com título específico e resumo de 3 a 5 linhas alinhado ao cargo-alvo.",
      },
      {
        action_title: "Reescrever descrições genéricas do currículo",
        action_description:
          "Aplicar as traduções sugeridas nas recomendações, detalhando atividades reais, ferramentas e contexto de cada experiência.",
        action_type: "Ajustar currículo",
        priority: "alta",
        timeframe: "5 dias",
        success_criteria:
          "Todas as experiências principais descritas com atividades específicas em vez de frases genéricas.",
      },
      {
        action_title: "Adicionar evidências de impacto",
        action_description:
          "Incluir métricas, resultados, aprendizados ou evidências qualitativas reais nas principais experiências.",
        action_type: "Organizar evidência",
        priority: "alta",
        timeframe: "5 dias",
        success_criteria:
          "O currículo deve mostrar pelo menos três evidências concretas de impacto profissional.",
      },
      {
        action_title: "Mapear lacunas reais de competência",
        action_description: `Comparar seu perfil com os requisitos típicos de ${role}${hasJob ? " e com a vaga enviada" : ""}, separando o que é lacuna de comunicação do que precisa ser desenvolvido.`,
        action_type: "Desenvolver competência",
        priority: "media",
        timeframe: "7 dias",
        success_criteria:
          "Lista escrita com requisitos em 'já tenho / preciso comunicar' e 'preciso desenvolver', com um plano para cada item.",
      },
      {
        action_title: "Fazer reanálise após os ajustes",
        action_description:
          "Depois de atualizar currículo e LinkedIn, envie os materiais novamente para comparar a evolução do score e das lacunas.",
        action_type: "Revisar posicionamento",
        priority: "media",
        timeframe: "14 dias",
        success_criteria:
          "Nova análise concluída com comparativo em relação a esta análise.",
      },
    ],
  };
}
