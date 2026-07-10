// Fase 2 da IA: matching dos jargões de mercado por área.
// A tabela market_jargons guarda keywords normalizáveis; aqui casamos
// o cargo/área digitados no wizard com a área curada mais adequada.

export interface JargonRow {
  area: string;
  keywords: string[];
  terms: string[];
  usage_note: string | null;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function matchJargons(
  rows: JargonRow[] | null | undefined,
  targetArea: string | null | undefined,
  targetRole: string | null | undefined
): JargonRow | null {
  if (!rows || rows.length === 0) return null;

  // Espaço nas bordas ajuda keywords com limite de palavra (ex.: " rh").
  const haystack = ` ${normalize(
    [targetArea, targetRole].filter(Boolean).join(" ")
  )} `;
  if (!haystack.trim()) return null;

  for (const row of rows) {
    const hit = row.keywords.some((keyword) =>
      haystack.includes(normalize(keyword))
    );
    if (hit) return row;
  }
  return null;
}
