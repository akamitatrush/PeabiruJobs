<div align="center">

<img src="public/logo.png" alt="PeabiruJobs" width="420"/>

### Mentor de carreira com IA para profissionais brasileiros

*Transforme sua experiência profissional em uma narrativa mais clara e competitiva.*

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_AI-D97757?style=for-the-badge&logo=claude&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br/>

[O produto](#-o-produto) •
[Funcionalidades](#-funcionalidades) •
[Arquitetura](#-arquitetura) •
[Fluxos](#-fluxos-do-produto) •
[Banco de dados](#-modelo-de-dados) •
[IA](#-camada-de-ia) •
[Como rodar](#-como-rodar) •
[Segurança](#-segurança)

</div>

---

## 🎯 O produto

O **PeabiruJobs** é um aplicativo web B2C para profissionais brasileiros em **recolocação ou transição de carreira**. Ele funciona como um mentor de carreira com IA: analisa currículo, LinkedIn, cargo-alvo e vagas de interesse para ajudar o usuário a **comunicar melhor a trajetória que já tem** — e a decidir com mais estratégia onde investir energia.

> O nome vem do **Peabiru**, a rede de caminhos indígenas pré-colombianos que conectava o litoral ao interior da América do Sul — uma trilha já existente que só precisava ser percorrida com orientação. É exatamente a proposta do produto: o caminho profissional do usuário já existe; a plataforma ajuda a enxergá-lo e comunicá-lo.

### Princípios inegociáveis

| ✅ O que o produto faz | ❌ O que o produto NÃO faz |
| --- | --- |
| Traduz experiências **reais** para linguagem de mercado | **Não inventa** experiências, métricas ou certificações |
| Diferencia lacuna real de lacuna de comunicação | **Não promete** contratação nem aprovação em vagas |
| Prioriza ajustes por impacto × esforço × urgência | **Não transforma** atividade operacional em cargo de liderança |
| Emite alertas de autenticidade nas sugestões de texto | **Não substitui** recrutadores nem processos seletivos |

---

## ✨ Funcionalidades

O MVP é focado em **3 funcionalidades centrais**, sustentadas por uma estrutura básica de produto (autenticação, dashboard, fluxo de análise e página de resultado).

### 1️⃣ Recomendações + tradução contextual da experiência

Analisa os materiais do usuário e gera uma lista de recomendações **priorizadas**, cada uma com:

- Categoria (`Competência` · `Comunicação` · `Evidência` · `Posicionamento`)
- **Impacto**, **esforço** e **urgência** (badges coloridos na UI)
- Ação sugerida + justificativa ("por quê")
- **Tradução contextual**: trecho original identificado → problema de comunicação → versão sugerida → termos de mercado relacionados
- ⚠️ Alerta de autenticidade quando há texto sugerido
- Botões *"Marcar como feita"* e *"Copiar sugestão"*, filtro por categoria

### 2️⃣ Diagnóstico de aderência

Mostra o quanto o perfil está alinhado ao **cargo-alvo** e, quando enviada, à **vaga específica**:

- **Score de 0 a 100** (anel de score visual) + nível textual (`Baixa aderência` → `Alta aderência`)
- Pontos fortes, lacunas e riscos separados
- Distinção explícita entre **lacuna real**, **lacuna de comunicação** e **lacuna de evidência**
- Recomendação final clara: `Aplicar agora` · `Aplicar com ajustes` · `Desenvolver lacunas antes de aplicar` · `Não priorizar esta vaga`

### 3️⃣ Plano de evolução + acompanhamento + reanálise

Transforma o diagnóstico em um plano prático:

- Ações com tipo, prioridade, **prazo sugerido** e **critério de sucesso**
- Status persistido (`Pendente` → `Em andamento` → `Concluído`) com barra de progresso
- **Reanálise**: novo ciclo com materiais atualizados e **comparativo automático** (score anterior → atual, recomendações concluídas, lacunas que continuam abertas)

---

## 🏗 Arquitetura

Visão geral de alto nível — Next.js App Router como aplicação única (SSR + API), Supabase como backend gerenciado e camada de IA plugável:

```mermaid
flowchart TB
    subgraph Cliente["🖥 Navegador"]
        UI["React 19 + Tailwind<br/>Landing · Auth · Dashboard<br/>Wizard · Resultado em abas"]
    end

    subgraph NextJS["▲ Next.js 15 (App Router)"]
        MW["Middleware<br/>renova sessão + protege rotas"]
        RSC["Server Components<br/>dashboard · resultado · reanálise"]
        API["API Route<br/>POST /api/analyses"]
        AI["lib/ai<br/>generateCareerAnalysis"]
    end

    subgraph Supabase["⚡ Supabase"]
        AUTH["Auth<br/>e-mail + senha<br/>cookies via @supabase/ssr"]
        DB[("PostgreSQL<br/>7 tabelas + RLS")]
        STORAGE["Storage<br/>bucket privado 'documents'<br/>pasta por usuário"]
    end

    subgraph Providers["🤖 Providers de IA"]
        MOCK["MockProvider<br/>padrão · determinístico · custo zero"]
        CLAUDE["AnthropicProvider<br/>claude-opus-4-8<br/>structured outputs"]
    end

    UI -->|"HTTPS"| MW
    MW --> RSC
    MW --> API
    UI -->|"upload direto<br/>(policy por pasta)"| STORAGE
    RSC -->|"queries com RLS"| DB
    API --> AI
    API -->|"insert/update"| DB
    MW <-->|"sessão"| AUTH
    AI -->|"AI_PROVIDER=mock"| MOCK
    AI -->|"AI_PROVIDER=anthropic"| CLAUDE
```

### Estrutura de pastas

```
app/
├── page.tsx                     # Landing page pública
├── (auth)/                      # Rotas de autenticação
│   ├── login/
│   ├── cadastro/
│   └── recuperar-senha/
├── (app)/                       # Área autenticada (middleware + layout com guard)
│   ├── dashboard/               # Resumo + histórico de análises
│   ├── nova-analise/            # Wizard de 8 etapas
│   ├── analise/[id]/            # Resultado em 4 abas
│   ├── reanalise/[id]/          # Wizard pré-preenchido + comparativo
│   ├── configuracoes/           # Perfil simples
│   └── redefinir-senha/
├── auth/callback/               # Troca de código por sessão (confirmação/recovery)
└── api/analyses/                # Orquestra a geração da análise

components/
├── ui/                          # Design system: Button, Card, Badge, Tabs,
│                                # ScoreRing, ProgressBar, Toast, EmptyState…
├── app/                         # Shell: NavLinks, LogoutButton
├── wizard/AnalysisWizard.tsx    # Fluxo compartilhado (análise + reanálise)
└── result/                      # OverviewTab, RecommendationsTab, FitTab, PlanTab

lib/
├── supabase/                    # Clients browser/server + middleware de sessão
├── ai/                          # generateCareerAnalysis + providers + tipos
└── types.ts                     # Tipos de domínio (espelham o schema)

supabase/migrations/0001_init.sql  # Tabelas + RLS + trigger + Storage
```

---

## 🔀 Fluxos do produto

### Jornada completa do usuário

```mermaid
flowchart LR
    A(["Cadastro /<br/>Login"]) --> B["Dashboard"]
    B --> C["Nova análise<br/>(wizard)"]
    C --> D["Resultado<br/>score + 4 abas"]
    D --> E["Aplica recomendações<br/>e marca ações concluídas"]
    E --> F["Reanálise com<br/>materiais atualizados"]
    F --> G["Comparativo<br/>score anterior → atual"]
    G -.->|"novo ciclo de evolução"| E
    D -.-> B
```

### Wizard de nova análise (8 etapas)

```mermaid
flowchart TD
    S1["1 · Boas-vindas"] --> S2["2 · Currículo<br/>upload PDF/DOC/DOCX/TXT ou texto colado"]
    S2 --> S3["3 · LinkedIn<br/>link público, PDF exportado ou texto"]
    S3 --> S4["4 · Cargo-alvo<br/>cargo + área + senioridade<br/>☑ 'não sei, quero sugestões'"]
    S4 --> S5{"5 · Vaga específica?"}
    S5 -->|"Adicionar vaga"| S6
    S5 -->|"Pular por enquanto"| S6["6 · Arquivos complementares<br/>certificados, projetos, evidências (opcional)"]
    S6 --> S7["7 · Revisão<br/>resumo do que será analisado"]
    S7 --> S8["8 · Processamento<br/>loading humanizado com mensagens"]
    S8 --> R(["Redirect → /analise/:id"])
```

### Geração da análise (ponta a ponta)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant W as Wizard (client)
    participant ST as Supabase Storage
    participant API as POST /api/analyses
    participant DB as PostgreSQL (RLS)
    participant IA as generateCareerAnalysis

    U->>W: preenche etapas e clica "Gerar análise"
    W->>ST: upload dos arquivos (pasta do usuário)
    ST-->>W: paths dos arquivos
    W->>API: payload (textos, cargo-alvo, vaga, docs)
    API->>DB: INSERT career_analyses (status: processing)
    API->>DB: INSERT user_documents
    API->>IA: materiais do usuário
    Note over IA: MockProvider (padrão)<br/>ou Claude com structured outputs
    IA-->>API: JSON {summary, recommendations,<br/>fit_diagnostics, evolution_plan}
    API->>DB: INSERT recommendations + fits + plano
    API->>DB: UPDATE análise (score, resumo, status: completed)
    API-->>W: { id }
    W->>U: redirect para /analise/:id
```

### Reanálise e comparativo

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant RW as Wizard de reanálise
    participant API as POST /api/analyses
    participant DB as PostgreSQL

    U->>RW: abre /reanalise/:id (campos pré-preenchidos)
    RW->>API: payload + original_analysis_id
    API->>DB: cria a NOVA análise (fluxo normal)
    API->>DB: lê score da análise original
    API->>DB: INSERT analysis_versions<br/>(score_change, melhorias, lacunas abertas)
    API->>DB: UPDATE original (status: reanalyzed)
    API-->>RW: { id da nova análise }
    Note over U: página de resultado mostra o card<br/>"Comparativo com a análise anterior"
```

### Autenticação e proteção de rotas

```mermaid
flowchart LR
    REQ["Request"] --> MW{"Middleware<br/>sessão válida?"}
    MW -->|"sim"| APP["Rotas protegidas<br/>/dashboard · /nova-analise<br/>/analise · /reanalise · /configuracoes"]
    MW -->|"não"| LOGIN["Redirect → /login?next=…"]
    MW -->|"logado acessando<br/>/login ou /cadastro"| DASH["Redirect → /dashboard"]
    APP --> RLS["Toda query passa pelo RLS:<br/>usuário só enxerga os próprios dados"]
```

---

## 🗄 Modelo de dados

7 tabelas, todas com **Row Level Security**. Perfil criado automaticamente por trigger no cadastro.

```mermaid
erDiagram
    auth_users ||--o| user_profiles : "trigger no cadastro"
    auth_users ||--o{ career_analyses : "possui"
    career_analyses ||--o{ user_documents : "recebe"
    career_analyses ||--o{ recommendations : "gera"
    career_analyses ||--o{ fit_diagnostics : "gera"
    career_analyses ||--o{ evolution_plans : "gera"
    career_analyses ||--o{ analysis_versions : "original / nova"

    user_profiles {
        uuid id PK
        uuid user_id FK
        text full_name
        text current_role
        text target_role
    }

    career_analyses {
        uuid id PK
        uuid user_id FK
        text title
        text target_role
        text target_area
        text target_seniority
        text status "processing | completed | reanalyzed"
        int overall_score "0-100"
        text summary
        text main_strength
        text main_gap
        text next_best_action
    }

    user_documents {
        uuid id PK
        uuid analysis_id FK
        text document_type "resume | linkedin_url | linkedin_pdf | job_description | complementary_file | pasted_text"
        text file_url
        text raw_text
    }

    recommendations {
        uuid id PK
        uuid analysis_id FK
        text category "competencia | comunicacao | evidencia | posicionamento"
        text impact "alto | medio | baixo"
        text effort "alto | medio | baixo"
        text urgency "alta | media | baixa"
        int priority_order
        text original_text
        text identified_issue
        text suggested_text
        text authenticity_warning
        text status "pendente | em_andamento | concluida"
    }

    fit_diagnostics {
        uuid id PK
        uuid analysis_id FK
        text fit_type "cargo_alvo | vaga_especifica"
        int score "0-100"
        text level
        text_array strengths
        text_array gaps
        text_array risks
        text recommendation
    }

    evolution_plans {
        uuid id PK
        uuid analysis_id FK
        text action_title
        text action_type
        text priority "alta | media | baixa"
        text timeframe
        text success_criteria
        text status "pendente | em_andamento | concluida"
    }

    analysis_versions {
        uuid id PK
        uuid original_analysis_id FK
        uuid new_analysis_id FK
        text improvements_summary
        text remaining_gaps
        int score_change
    }
```

---

## 🤖 Camada de IA

`lib/ai/generateCareerAnalysis.ts` é o **ponto único** de geração. Recebe os materiais do usuário e devolve sempre o mesmo contrato JSON:

```jsonc
{
  "summary": {
    "overall_score": 78,
    "general_diagnosis": "…",
    "main_strength": "…",
    "main_gap": "…",
    "next_best_action": "…"
  },
  "recommendations": [ /* categoria, impacto, esforço, urgência,
                          tradução contextual, alerta de autenticidade… */ ],
  "fit_diagnostics":  [ /* cargo_alvo e, se houver, vaga_especifica */ ],
  "evolution_plan":   [ /* ações com prazo e critério de sucesso */ ]
}
```

### Providers plugáveis

```mermaid
flowchart LR
    CALL["generateCareerAnalysis(input)"] --> ENV{"AI_PROVIDER"}
    ENV -->|"mock (padrão)"| M["🎭 MockProvider<br/>determinístico, adaptado ao cargo-alvo,<br/>custo zero — a PoC funciona sem chave"]
    ENV -->|"anthropic"| C["🧠 Claude (claude-opus-4-8)<br/>thinking adaptativo + structured outputs<br/>(JSON Schema garante o formato)"]
    C -->|"falha na API"| M
```

| Provider | Quando usar | Custo |
| --- | --- | --- |
| `mock` *(padrão)* | Desenvolvimento, demo, validação de UX | Zero |
| `anthropic` | Produção com análises reais | Por token (API Anthropic) |

Trocar de provider é **só variável de ambiente** — nenhuma mudança de código.

### As 15 regras da IA

O system prompt do provider real (e o comportamento do mock) seguem regras fixas de autenticidade:

1. Não inventar experiências · 2. Não criar métricas falsas · 3. Não afirmar domínio de ferramentas não mencionadas · 4. Não prometer contratação · 5. Não prever aprovação em vaga · 6. Justificar cada recomendação · 7. Diferenciar lacuna real de lacuna de comunicação · 8. Diferenciar lacuna de competência, evidência e posicionamento · 9. Linguagem clara, acolhedora e prática · 10. Recomendações específicas aos materiais enviados · 11. Sinalizar baixa confiança pedindo complemento · 12. Preservar autenticidade · 13. Não inflar atividade operacional para liderança · 14. Não adicionar certificações não informadas · 15. Não sugerir exageros que quebrem a confiança do usuário

---

## 🚀 Como rodar

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (plano free é suficiente)

### 1 · Instalar dependências

```bash
npm install
```

### 2 · Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Abra o **SQL Editor** e execute o conteúdo de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — cria tabelas, RLS, trigger de perfil e o bucket privado de Storage de uma vez
3. Para testar sem SMTP: **Authentication → Providers → Email** → desative *"Confirm email"*

### 3 · Variáveis de ambiente

```bash
cp .env.example .env.local
```

| Variável | Obrigatória | Descrição |
| --- | :---: | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave publishable/anon (Settings → API Keys) |
| `AI_PROVIDER` | — | `mock` *(padrão)* ou `anthropic` |
| `ANTHROPIC_API_KEY` | — | Apenas com `AI_PROVIDER=anthropic` |

### 4 · Rodar em desenvolvimento

```bash
npm run dev
# → http://localhost:3000
```

### 5 · Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com)
2. Configure as **mesmas variáveis de ambiente** acima (Settings → Environment Variables)
3. Deploy — sem configuração extra de build

> 💡 **Erro "Your project's URL and Key are required to create a Supabase client!"** no deploy = variáveis de ambiente não configuradas na Vercel (ou deploy feito antes de adicioná-las — faça um *Redeploy* após salvar).

---

## 🔒 Segurança

| Camada | Mecanismo |
| --- | --- |
| **Rotas** | Middleware verifica a sessão e redireciona não autenticados para `/login` |
| **Banco** | RLS em **todas** as tabelas — `auth.uid()` filtra tudo; tabelas filhas validam via join com `career_analyses` |
| **Storage** | Bucket privado com policy por pasta: usuário só lê/escreve em `documents/{seu_id}/…` |
| **Sessão** | Cookies httpOnly gerenciados por `@supabase/ssr`, renovados no middleware |
| **Chaves** | Apenas a chave *publishable* vai ao cliente (pública por design); nenhuma `service_role` é usada no projeto |

---

## 🧭 Decisões técnicas e limitações da PoC

| Decisão | Racional |
| --- | --- |
| **PDF/DOC não são parseados** nesta versão | Parsing server-side é frágil para PoC. Arquivos ficam salvos no Storage e vinculados à análise; o texto analisado vem do campo "colar texto" (`.txt` é lido no navegador). A interface da função de IA não muda quando um parser for plugado. |
| **Link do LinkedIn não é raspado** | Scraping viola os termos do LinkedIn. O link é armazenado como documento; o conteúdo vem do texto colado ou do PDF exportado. |
| **Mock determinístico** como padrão | Mesma entrada → mesma saída. Permite validar UX, banco e fluxo completo sem custo de IA. |
| **Tailwind v3.4** (não v4) | Config clássica, previsível e amplamente documentada para manutenção. |

### Roadmap natural

- [ ] Parser de PDF/DOCX server-side (alimentar `resume_text` automaticamente)
- [ ] Sugestão de cargos para quem marca *"não sei qual cargo buscar"*
- [ ] E-mails transacionais (boas-vindas, plano concluído, lembrete de reanálise)
- [ ] Exportar recomendações em PDF
- [ ] Histórico de evolução com gráfico de score ao longo das reanálises

---

<div align="center">

**PeabiruJobs** não promete contratação e não inventa experiências.<br/>
A proposta é ajudar você a comunicar melhor sua trajetória e tomar decisões mais estratégicas.

</div>
