# Contribuindo com o PeabiruJobs

> Novo no projeto? Comece pelo **[guia de onboarding](docs/onboarding.md)** — acessos, setup local e primeira contribuição.

## Fluxo de trabalho

1. **Crie uma branch** a partir da principal:
   - `feature/nome-curto` · `fix/nome-curto` · `docs/nome-curto`
2. **Desenvolva** seguindo as convenções abaixo
3. **Valide localmente:** `npm run build` precisa passar
4. **Abra um PR** — o template é preenchido automaticamente; capriche no "Como testar"
5. **CI verde + review** → merge

## Convenções de código

- **TypeScript estrito** — sem `any` gratuito
- **Server Components por padrão**; `"use client"` apenas quando há interatividade
- **Design system primeiro:** novos elementos visuais entram em `components/ui/` se forem reutilizáveis
- **Textos da UI em pt-BR**, claros e acolhedores (ver [docs/produto.md](docs/produto.md) §5)
- **Valores canônicos do banco** em minúsculo sem acento (`comunicacao`, `concluida`); labels de exibição em `lib/types.ts`

## Banco de dados

- Toda mudança de schema = **migration nova** em `supabase/migrations/` (`0002_...`, `0003_...`)
- Nunca edite uma migration já aplicada
- Toda tabela nova **nasce com RLS** e política por usuário (ver [docs/seguranca.md](docs/seguranca.md))

## Regras de produto invioláveis

Qualquer contribuição que toque na análise de IA deve preservar as regras de autenticidade — não inventar experiências, métricas ou certificações, e nunca prometer contratação. Detalhes em [docs/produto.md](docs/produto.md).

## Revisão de PRs

- **Qualquer colaborador pode revisar e aprovar** — a regra da `main` exige 1 aprovação de qualquer membro, não de uma pessoa específica
- O [`.github/CODEOWNERS`](.github/CODEOWNERS) solicita revisores automaticamente por área (banco/IA/infra → devs; docs de produto → POs). Ao entrar no time, adicione seu usuário na área que você domina
- Boas práticas de quem revisa: rodar o preview da Vercel linkado no PR, conferir o "como testar" da descrição e pedir mudanças com comentários específicos
- Autor não aprova o próprio PR

## Documentação

| Mudou o quê? | Atualize |
| --- | --- |
| Comportamento do produto | `docs/produto.md` |
| Estrutura técnica | `docs/arquitetura.md` + diagramas do README |
| Deploy/ambientes | `docs/devops.md` |
| Auth/RLS/dados | `docs/seguranca.md` |
