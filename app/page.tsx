import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Logo, LogoMark } from "@/components/ui/Logo";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Envie seu currículo e LinkedIn",
    description:
      "Faça upload dos arquivos ou cole o texto dos seus materiais profissionais.",
  },
  {
    step: "2",
    title: "Informe um cargo-alvo ou uma vaga",
    description:
      "Diga para onde você quer ir — um cargo desejado ou uma vaga específica.",
  },
  {
    step: "3",
    title: "Receba diagnóstico e recomendações",
    description:
      "Score de aderência, pontos fortes, lacunas e melhorias priorizadas por impacto.",
  },
  {
    step: "4",
    title: "Ajuste e acompanhe sua evolução",
    description:
      "Siga o plano de ação, marque seu progresso e faça reanálises para medir a evolução.",
  },
];

const BENEFITS = [
  {
    title: "Recomendações para currículo e LinkedIn",
    description:
      "Melhorias práticas e priorizadas por impacto, esforço e urgência — você sabe o que ajustar primeiro.",
  },
  {
    title: "Diagnóstico de aderência a cargos e vagas",
    description:
      "Score de 0 a 100 com pontos fortes, lacunas reais, lacunas de comunicação e uma recomendação clara.",
  },
  {
    title: "Tradução da experiência para linguagem de mercado",
    description:
      "Suas experiências reais reescritas de forma mais clara e competitiva — sem inventar nada.",
  },
  {
    title: "Plano de evolução com ações priorizadas",
    description:
      "Um plano prático com prazos, critérios de sucesso e acompanhamento do que já foi concluído.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="PeabiruJobs">
            <Logo />
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Entrar
            </Link>
            <ButtonLink href="/cadastro" size="sm">
              Criar conta
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Transforme sua experiência profissional em uma narrativa mais
            clara e competitiva.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            PeabiruJobs analisa seu currículo, LinkedIn e vagas de interesse
            para recomendar melhorias, avaliar aderência e criar um plano de
            evolução profissional.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/cadastro" size="lg">
              Começar análise
            </ButtonLink>
            <ButtonLink href="#como-funciona" variant="outline" size="lg">
              Ver como funciona
            </ButtonLink>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="bg-surface py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
              Como funciona
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-800">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O que você recebe */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
              O que você recebe
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"
                >
                  <h3 className="text-base font-semibold text-slate-800">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + Aviso de responsabilidade */}
        <section className="bg-brand-900 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-2xl font-semibold text-white">
              Pronto para comunicar melhor a sua trajetória?
            </h2>
            <div className="mt-8">
              <ButtonLink href="/cadastro" size="lg" variant="primary">
                Começar análise
              </ButtonLink>
            </div>
            <p className="mt-10 text-sm leading-relaxed text-brand-200">
              O PeabiruJobs não promete contratação e não inventa
              experiências. A proposta é ajudar você a comunicar melhor sua
              trajetória e tomar decisões mais estratégicas.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center text-sm text-slate-400">
          <LogoMark className="h-7 w-auto" />
          <span>
            © {new Date().getFullYear()} PeabiruJobs. Mentor de carreira com
            IA.
          </span>
        </div>
      </footer>
    </div>
  );
}
