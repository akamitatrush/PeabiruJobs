-- ============================================================
-- PeabiruJobs — Fase 2 da IA: jargões de mercado por área
-- Consultados na hora da análise e injetados no prompt de usuário
-- (docs/ia.md §3). Tabela curada pelo time; leitura por usuários
-- autenticados, escrita apenas administrativa (painel/migrations).
-- ============================================================

create table if not exists public.market_jargons (
  id uuid primary key default gen_random_uuid(),
  area text not null unique,
  -- palavras-chave para casar com o cargo/área digitados no wizard
  -- (comparação sem acento e em minúsculo, feita na aplicação)
  keywords text[] not null default '{}',
  terms text[] not null,
  usage_note text,
  created_at timestamptz not null default now()
);

alter table public.market_jargons enable row level security;

create policy "authenticated read" on public.market_jargons
  for select to authenticated using (true);

-- ============================================================
-- Seed inicial: 10 áreas comuns (curadoria evolui pelo painel)
-- ============================================================

insert into public.market_jargons (area, keywords, terms, usage_note) values
(
  'administrativo',
  array['administra', 'adm', 'secretari', 'escritorio', 'backoffice', 'auxiliar de escritorio'],
  array['rotinas administrativas', 'gestão de demandas', 'controle de documentos', 'apoio operacional', 'organização de processos', 'lançamento de dados', 'planilhas de controle', 'agenda executiva', 'arquivo e protocolo', 'suporte à gestão', 'follow-up de pendências'],
  'Priorizar termos de organização e controle; evitar inflar apoio operacional para gestão.'
),
(
  'atendimento',
  array['atendimento', 'cliente', 'sac', 'suporte', 'call center', 'recepc', 'telemarketing'],
  array['relacionamento com clientes', 'resolução de problemas', 'experiência do cliente', 'atendimento multicanal', 'escuta ativa', 'retenção de clientes', 'satisfação do cliente (CSAT)', 'cumprimento de SLA', 'pós-venda', 'comunicação interpessoal'],
  'Usar métricas (CSAT, SLA) apenas se o usuário demonstrar contato real com indicadores.'
),
(
  'dados',
  array['dados', 'data ', 'analytics', 'business intelligence', ' bi', 'cientista'],
  array['análise exploratória', 'pipeline de dados', 'dashboards', 'KPIs', 'SQL', 'modelagem de dados', 'ETL', 'visualização de dados', 'storytelling com dados', 'métricas de negócio', 'governança de dados'],
  'Só citar ferramentas (SQL, BI) que o usuário mencionou nos materiais.'
),
(
  'desenvolvimento',
  array['desenvolv', 'programador', 'software', 'front-end', 'frontend', 'back-end', 'backend', 'fullstack', 'full stack', 'dev '],
  array['versionamento (Git)', 'code review', 'APIs REST', 'testes automatizados', 'CI/CD', 'arquitetura de software', 'metodologias ágeis', 'refatoração', 'banco de dados', 'documentação técnica'],
  'Não atribuir stack ou linguagem que não apareça explicitamente nos materiais.'
),
(
  'design',
  array['design', ' ux', 'ux ', ' ui', 'ui ', 'produto digital', 'experiencia do usuario'],
  array['pesquisa com usuários', 'prototipação', 'design system', 'jornada do usuário', 'testes de usabilidade', 'wireframes', 'acessibilidade', 'arquitetura da informação', 'descoberta de produto', 'handoff para desenvolvimento'],
  'Diferenciar design gráfico de UX/UI conforme a experiência real do usuário.'
),
(
  'marketing',
  array['marketing', 'growth', 'midias sociais', 'redes sociais', 'conteudo', 'trafego'],
  array['funil de conversão', 'geração de leads', 'SEO', 'mídia paga', 'calendário editorial', 'segmentação de público', 'métricas de campanha (CTR, CAC)', 'branding', 'copywriting', 'CRM'],
  'Métricas de campanha só quando o usuário tiver operado campanhas de fato.'
),
(
  'financeiro',
  array['financeir', 'contab', 'fiscal', 'tesouraria', 'contas a pagar', 'contas a receber', 'faturamento'],
  array['contas a pagar e receber', 'conciliação bancária', 'fluxo de caixa', 'fechamento contábil', 'análise de custos', 'orçamento (budget)', 'relatórios gerenciais', 'compliance fiscal', 'faturamento', 'DRE'],
  'Termos contábeis formais (DRE, fechamento) apenas com experiência comprovada na função.'
),
(
  'recursos humanos',
  array['recursos humanos', ' rh', 'rh ', 'recrutamento', 'selecao', 'departamento pessoal', ' dp', 'gente e gestao'],
  array['recrutamento e seleção', 'onboarding', 'rotinas de departamento pessoal', 'folha de pagamento', 'clima organizacional', 'treinamento e desenvolvimento', 'avaliação de desempenho', 'gestão de benefícios', 'cultura organizacional', 'employer branding'],
  'Separar DP (operacional) de subsistemas de RH (estratégico) conforme a vivência real.'
),
(
  'logistica',
  array['logistic', 'estoque', 'almoxarifado', 'supply', 'transporte', 'expedicao', 'armazem'],
  array['gestão de estoque', 'inventário', 'expedição', 'roteirização', 'controle de entrada e saída', 'supply chain', 'indicadores logísticos (OTIF)', 'armazenagem', 'conferência de cargas', 'abastecimento'],
  'Indicadores (OTIF) apenas se o usuário acompanhava métricas na operação.'
),
(
  'vendas',
  array['vendas', 'comercial', 'vendedor', 'sdr', 'closer', 'negociacao', 'representante'],
  array['prospecção', 'funil de vendas', 'negociação', 'metas e quotas', 'CRM', 'qualificação de leads', 'carteira de clientes', 'pós-venda', 'upsell e cross-sell', 'forecast de vendas'],
  'Resultados de meta só com números reais do usuário; nunca estimar percentuais.'
)
on conflict (area) do nothing;
