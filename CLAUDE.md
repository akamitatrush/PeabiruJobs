# PeabiruJobs — instruções para o Claude Code

Mentor de carreira com IA (B2C, pt-BR): analisa currículo/LinkedIn, gera recomendações, diagnóstico de aderência e plano de evolução. Next.js 15 (App Router) + TypeScript + Tailwind v3 + Supabase. Documentação em `docs/` (produto, arquitetura, devops, segurança, onboarding).

## Comandos

```bash
npm run dev      # desenvolvimento (http://localhost:3000)
npm run build    # OBRIGATÓRIO passar antes de qualquer commit
```

O build exige `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (placeholders funcionam para validar compilação).

## Mapa do código

- `app/(auth)/` páginas públicas de auth · `app/(app)/` área logada (protegida por `middleware.ts`)
- `app/api/analyses/route.ts` — único endpoint de escrita orquestrada (cria análise + chama IA + persiste)
- `components/ui/` design system (usar antes de criar componente novo) · `components/wizard/` e `components/result/` features
- `lib/ai/` — `generateCareerAnalysis` com providers `mock` (padrão) e `anthropic`; contrato em `lib/ai/types.ts`
- `lib/types.ts` — tipos de domínio, espelham o schema
- `supabase/migrations/` — schema SQL + RLS

## Convenções (seguir sempre)

- **Textos de UI em pt-BR**, tom claro e acolhedor; sem promessas de contratação
- **Valores canônicos do banco** em minúsculo sem acento (`comunicacao`, `concluida`); labels de exibição via mapas em `lib/types.ts`
- **Server Components por padrão**; `"use client"` só com interatividade
- Mudança de schema = **migration nova** em `supabase/migrations/` (nunca editar migration aplicada); **toda tabela nova nasce com RLS** por usuário
- Commits em inglês no imperativo; branches `feature/…`, `fix/…`, `docs/…`

## Regras de produto invioláveis (afetam código e copy)

A IA e todos os textos NUNCA: inventam experiências/métricas/certificações, prometem contratação, preveem aprovação em vaga ou transformam atividade operacional em liderança. Sugestões de texto para o usuário sempre acompanham alerta de autenticidade. Detalhes: `docs/produto.md` §5.

## Nunca fazer

- Commitar segredos (`.env*`, chaves `sk-…`/`sbp_…`/`service_role`) — a única chave pública é a anon/publishable
- Usar a `service_role` key no código
- Editar migrations já aplicadas
- Merge direto na `main` — todo trabalho vira PR (CI precisa passar)
