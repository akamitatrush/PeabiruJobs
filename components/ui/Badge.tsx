import type { ReactNode } from "react";

type Tone =
  | "neutral"
  | "brand"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  blue: "bg-sky-50 text-sky-700",
  violet: "bg-violet-50 text-violet-700",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Mapas de tom por semântica do domínio
export function impactTone(value: string): Tone {
  if (value === "alto" || value === "alta") return "red";
  if (value === "medio" || value === "media") return "amber";
  return "neutral";
}

export function effortTone(value: string): Tone {
  if (value === "baixo" || value === "baixa") return "green";
  if (value === "medio" || value === "media") return "amber";
  return "red";
}

export function categoryTone(category: string): Tone {
  switch (category) {
    case "posicionamento":
      return "violet";
    case "comunicacao":
      return "blue";
    case "evidencia":
      return "amber";
    case "competencia":
      return "brand";
    default:
      return "neutral";
  }
}
