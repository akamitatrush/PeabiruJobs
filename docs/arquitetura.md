# 🏗 Arquitetura Técnica

> Como o PeabiruJobs é construído: front-end, back-end, camada de IA e as decisões por trás de cada escolha. Diagramas de alto nível estão no [README](../README.md#-arquitetura); aqui vai o detalhe por disciplina.

## 1. Visão geral

Aplicação **Next.js 15 (App Router)** única — SSR + API routes no mesmo deploy — com **Supabase** como backend gerenciado (Auth, Postgres, Storage) e camada de IA plugável.

```
Navegador ── HTTPS ──▶ Next.js (Vercel) ──▶ Supabase (Auth + Postgres/RLS + Storage)
                          │
                          └──▶ lib/ai → MockProvider | AnthropicProvider
```

**Por que essa stack:** velocidade de MVP com segurança real. Supabase entrega auth + banco + RLS + storage sem backend próprio; Next.js unifica front e API; a camada de IA isolada permite trocar mock ↔ produção por variável de ambiente.

## 2. Front-End

### Organização

| Camada | Onde | Padrão |
| --- | --- | --- |
| Rotas e páginas | `app/` | App Router com route groups: `(auth)` público, `(app)` protegido |
| Design system | `components/ui/` | Componentes puros, sem lógica de domínio |
| Componentes de feature | `components/{wizard,result,app}/` | Conhecem o domínio, consomem o design system |
| Tipos de domínio | `lib/types.ts` | Espelham o schema do banco |

### Server Components × Client Components

- **Server Components (padrão):** dashboard, página de resultado, layout protegido — buscam dados direto do Supabase com a sessão do usuário (cookies), sem waterfall no cliente.
- **Client Components (`"use client"`):** onde há interatividade — wizard, abas, marcação de status, formulários de auth, toasts.
- **Regra prática:** dados descem por props de um Server Component pai; mutações pontuais (marcar recomendação/ação) são feitas no cliente direto no Supabase, protegidas por RLS.

### Design system (`components/ui/`)

`Button/ButtonLink`, `Card`, `Badge` (com mapeamentos semânticos de tom por impacto/esforço/categoria), `Tabs`, `ScoreRing` (SVG puro), `ProgressBar`, `Toast` (context + hook), `EmptyState`, `Spinner`, `Field` (Input/Textarea/Select/Label), `Logo`.

**Convenções:** Tailwind com paleta `brand` customizada; espaçamento generoso; badges para prioridade/impacto/score; microcopy humana em pt-BR; responsivo mobile-first.

### Fluxos com estado complexo

- **`AnalysisWizard`** — máquina de passos (0–7) com validação por etapa, uploads para o Storage e estado de processamento com mensagens rotativas. Reutilizado pela reanálise via prop `initial`.
- **Abas do resultado** — estado local por aba com update otimista + rollback informado por toast em caso de erro.

## 3. Back-End

### API Route: `POST /api/analyses`

Único endpoint de escrita orquestrada. Sequência:

1. Autentica via cookies (`supabase.auth.getUser()`)
2. Valida payload (cargo-alvo obrigatório)
3. `INSERT career_analyses` com `status: processing`
4. `INSERT user_documents` (textos + referências de arquivos do Storage)
5. Chama `generateCareerAnalysis` (mock ou Anthropic)
6. Persiste `recommendations`, `fit_diagnostics`, `evolution_plans` (em paralelo)
7. `UPDATE` da análise com score/resumo e `status: completed`
8. Se reanálise: calcula `score_change`, grava `analysis_versions`, marca original como `reanalyzed`

**Escrita direta do cliente** (sem API) apenas para mutações simples protegidas por RLS: status de recomendações/ações e perfil do usuário.

### Camada de IA (`lib/ai/`)

| Arquivo | Papel |
| --- | --- |
| `types.ts` | Contrato de entrada/saída (`CareerAnalysisInput` → `CareerAnalysisResult`) |
| `generateCareerAnalysis.ts` | Dispatcher por `AI_PROVIDER`, com fallback para mock em falha |
| `mock.ts` | Análise determinística realista (mesma entrada → mesma saída) |
| `anthropic.ts` | `claude-opus-4-8` com thinking adaptativo + structured outputs (JSON Schema) e as 15 regras no system prompt |

**Garantia de formato:** o provider real usa `output_config.format` com JSON Schema — a resposta já chega validada, sem parsing frágil.

### Modelo de dados

7 tabelas (ver [migration](../supabase/migrations/0001_init.sql) e ER no README): `user_profiles`, `career_analyses`, `user_documents`, `recommendations`, `fit_diagnostics`, `evolution_plans`, `analysis_versions`. Convenções:

- Valores canônicos em pt-BR minúsculo sem acento (`comunicacao`, `concluida`) com labels de exibição em `lib/types.ts`
- `CHECK constraints` para enums; `updated_at` por trigger; perfil criado por trigger no signup
- `"current_role"` entre aspas na migration (palavra reservada no Postgres)

## 4. Decisões de arquitetura (ADR resumido)

| # | Decisão | Alternativa rejeitada | Motivo |
| --- | --- | --- | --- |
| 1 | Supabase (BaaS) | Backend Node próprio | Auth+RLS+Storage prontos; MVP em dias, não semanas |
| 2 | Geração síncrona na API route (`maxDuration: 60`) | Fila/worker assíncrono | Simplicidade; mock é instantâneo e o Claude responde < 60s. Fila entra se houver volume |
| 3 | Provider de IA por env var com fallback | Acoplamento direto ao SDK | Demo sem custo, produção sem mudança de código |
| 4 | Texto colado como fonte primária | Parser de PDF server-side | Parsing é frágil; o contrato da IA não muda quando o parser chegar |
| 5 | Tailwind v3.4 | Tailwind v4 | Config estável e amplamente documentada |
| 6 | Mutações simples direto do cliente | Tudo via API routes | RLS já garante segurança; menos código para o mesmo resultado |
| 7 | Status de análise em 3 estados (`processing/completed/reanalyzed`) | Workflow complexo | Suficiente para o ciclo do MVP |

## 5. Pontos de extensão

- **Parser de documentos:** plugar em `POST /api/analyses` antes do passo 5, preenchendo `resume_text` a partir do arquivo no Storage
- **Novos providers de IA:** implementar `(input: CareerAnalysisInput) => Promise<CareerAnalysisResult>` e registrar no dispatcher
- **Fila assíncrona:** trocar a chamada direta por job (ex.: QStash/Inngest) mantendo o contrato; a UI já suporta `status: processing`
- **Sugestão de cargos:** novo endpoint consumindo os mesmos documentos da análise
