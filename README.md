# PeabiruJobs — Mentor de carreira com IA

MVP de um aplicativo web B2C para profissionais brasileiros em recolocação ou transição de carreira. O produto analisa currículo, LinkedIn e vagas de interesse para gerar:

1. **Recomendações** para currículo, LinkedIn e tradução contextual da experiência;
2. **Diagnóstico de aderência** ao cargo-alvo e à vaga específica (score 0–100);
3. **Plano de evolução profissional**, com acompanhamento e reanálise comparativa.

> ⚠️ O PeabiruJobs **não promete contratação e não inventa experiências**. A proposta é ajudar o usuário a comunicar melhor a trajetória real e tomar decisões mais estratégicas.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 3.4
- Supabase (Auth com cookies via `@supabase/ssr`, Postgres com RLS, Storage)
- IA plugável: provider **mock** (padrão) ou **Anthropic** (`claude-opus-4-8`)

## Rodando localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra o **SQL Editor** e execute o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Isso cria:
   - as 7 tabelas (`user_profiles`, `career_analyses`, `user_documents`, `recommendations`, `fit_diagnostics`, `evolution_plans`, `analysis_versions`);
   - políticas de **Row Level Security** (cada usuário só acessa os próprios dados);
   - o bucket privado `documents` no Storage (pasta por usuário);
   - trigger que cria o perfil automaticamente no cadastro.
3. Em **Authentication → Providers → Email**, mantenha e-mail/senha habilitado. Para testar sem SMTP, desative "Confirm email".

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anônima (Settings → API) |
| `AI_PROVIDER` | — | `mock` (padrão) ou `anthropic` |
| `ANTHROPIC_API_KEY` | — | Necessária apenas com `AI_PROVIDER=anthropic` |

### 4. Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Deploy (PoC utilizável em produção)

O projeto está pronto para deploy na [Vercel](https://vercel.com) (ou qualquer host Node):

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente acima.
3. Deploy — o build usa `next build` sem configurações extras.

Com `AI_PROVIDER=mock`, o produto funciona de ponta a ponta sem custo de IA: a análise é simulada de forma realista e determinística. Para ligar a IA real, basta definir `AI_PROVIDER=anthropic` e `ANTHROPIC_API_KEY` — nenhuma mudança de código é necessária.

## Arquitetura

```
app/
  page.tsx                    Landing page
  (auth)/                     Login, cadastro, recuperação de senha
  (app)/                      Área autenticada (redirect via middleware)
    dashboard/                Resumo + lista de análises
    nova-analise/             Wizard de 8 etapas
    analise/[id]/             Resultado em abas (visão geral, recomendações,
                              aderência, plano de evolução)
    reanalise/[id]/           Wizard pré-preenchido + comparativo
    configuracoes/            Perfil simples
  api/analyses/               POST: cria análise, salva documentos, chama a IA
                              e persiste recomendações/diagnósticos/plano
components/
  ui/                         Design system (Button, Card, Badge, Tabs,
                              ScoreRing, ProgressBar, Toast, EmptyState…)
  wizard/AnalysisWizard.tsx   Fluxo de nova análise/reanálise
  result/                     Abas da página de resultado
lib/
  supabase/                   Clients browser/server + middleware de sessão
  ai/                         generateCareerAnalysis + providers (mock, Anthropic)
  types.ts                    Tipos de domínio
supabase/migrations/          Schema SQL + RLS + Storage
```

### Função de IA

`lib/ai/generateCareerAnalysis.ts` recebe os materiais do usuário e retorna o JSON estruturado com `summary`, `recommendations`, `fit_diagnostics` e `evolution_plan`.

- **Mock** (`lib/ai/mock.ts`): dados realistas e determinísticos, adaptados ao cargo-alvo e aos materiais enviados.
- **Anthropic** (`lib/ai/anthropic.ts`): usa `claude-opus-4-8` com *structured outputs* (JSON Schema) e as 15 regras de autenticidade no system prompt. Se a chamada falhar, faz fallback para o mock.

### Decisões e limitações da PoC

- **Extração de texto de PDF/DOC**: os arquivos são salvos no Storage e vinculados à análise, mas o texto usado pela IA vem do campo "colar texto" (ou de arquivos `.txt`, lidos no navegador). A UI orienta o usuário. Quando um parser server-side for plugado, a interface da função de IA não muda.
- **Link do LinkedIn/vaga**: armazenado como documento; o conteúdo analisado vem do texto colado (scraping do LinkedIn viola os termos da plataforma).
- **Segurança**: RLS em todas as tabelas, rotas protegidas por middleware, bucket privado com policy por pasta do usuário.
