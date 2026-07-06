# ⚙️ DevOps

> Ambientes, deploy, estratégia de branches, CI e operação do PeabiruJobs.

## 1. Ambientes

| Ambiente | Onde | Banco | IA | Objetivo |
| --- | --- | --- | --- | --- |
| **Local** | `npm run dev` | Projeto Supabase (dev ou o mesmo da PoC) | `mock` | Desenvolvimento |
| **Preview** | Vercel (deploy automático por branch/PR) | Mesmo projeto Supabase | `mock` | Validação de PRs |
| **Production** | Vercel (branch principal) | Projeto Supabase de produção | `mock` ou `anthropic` | Usuários reais |

> 💡 Quando o produto crescer, separe **dois projetos Supabase** (dev/prod) para preview não tocar em dados reais.

## 2. Variáveis de ambiente

| Variável | Escopo | Sensível? | Descrição |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Não | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Não (pública por design, protegida por RLS) | Chave publishable/anon |
| `AI_PROVIDER` | server | Não | `mock` (padrão) ou `anthropic` |
| `ANTHROPIC_API_KEY` | server | **Sim** | Só com `AI_PROVIDER=anthropic`; nunca com prefixo `NEXT_PUBLIC_` |

Na Vercel: **Settings → Environment Variables**, marcando Production/Preview/Development. Variável nova exige **Redeploy**.

## 3. Deploy (Vercel)

1. Importar o repositório GitHub na Vercel (framework autodetectado: Next.js)
2. Configurar as variáveis acima
3. Cada `git push` gera deploy automático: branch de produção → Production; demais branches/PRs → Preview com URL própria

**Erros comuns:**

| Sintoma | Causa | Correção |
| --- | --- | --- |
| `Your project's URL and Key are required…` | Variáveis ausentes no build | Adicionar variáveis + Redeploy |
| Login funciona mas dados não aparecem | Migration não executada | Rodar `supabase/migrations/0001_init.sql` no SQL Editor |
| Cadastro pede confirmação eternamente | SMTP free limitado | Desligar "Confirm email" (teste) ou configurar SMTP próprio (produção) |

## 4. Banco de dados (Supabase)

- **Migrations:** arquivos SQL versionados em `supabase/migrations/`, aplicados via SQL Editor (PoC) ou `supabase db push` (CLI). Migration nova = arquivo novo (`0002_...`), nunca editar migration já aplicada.
- **Storage:** bucket `documents` criado pela migration inicial, privado, com policy por pasta de usuário.
- **Backups:** o plano free mantém backups diários limitados; para produção real, avaliar plano Pro + PITR.

## 5. Estratégia de branches e commits

```
main (produção)
  └── feature/nome-curto      # nova funcionalidade
  └── fix/nome-curto          # correção
  └── docs/nome-curto         # documentação
```

- PR obrigatório para a branch principal (proteger em Settings → Branches)
- Commits no imperativo, descrevendo o "porquê" no corpo quando relevante
- Template de PR em `.github/PULL_REQUEST_TEMPLATE.md` — preenchido automaticamente ao abrir PRs

## 6. CI (GitHub Actions)

Workflow em [`.github/workflows/ci.yml`](../.github/workflows/ci.yml): a cada push/PR roda `npm ci` + `next build` (com placeholders de env). Garante que **nenhum PR quebra o build** antes do review.

Evoluções naturais: ESLint + Prettier check, testes (Vitest + Playwright), análise de bundle.

## 7. Observabilidade (roadmap)

| Necessidade | Sugestão |
| --- | --- |
| Erros em produção | Sentry (`@sentry/nextjs`) |
| Analytics de produto | Vercel Analytics ou PostHog |
| Logs da API | Vercel Logs (nativo) |
| Custo de IA | Dashboard da Anthropic + log de tokens por análise |
