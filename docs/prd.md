# 📄 PRD — PeabiruJobs MVP

> **Product Requirements Document.** Deriva do [One Page](one-page.md) (visão e discovery) e da [Jornada do Usuário](jornada-usuario.md). User stories detalhadas por épico: [produto.md](produto.md) §4.
>
> **Status:** vivo · **Versão:** 1.0 · **Time:** ver [README §Time](../README.md#-time)

**Legenda de status de implementação:** ✅ implementado · 🔨 parcial · 📋 planejado (não construído)

---

## 1. Contexto e problema

Profissionais brasileiros em recolocação/transição sofrem com falta de **diagnóstico** (não sabem o que está errado), de **tradução** (têm experiência, comunicam mal), de **priorização** (não sabem por onde começar) e de **acompanhamento** (não medem evolução). Detalhamento completo, dados de mercado (PNAD/Caged) e análise de alternativas: [One Page §Problema](one-page.md#problema).

## 2. Objetivos do MVP

1. Validar que a análise é percebida como **clara, útil, humana e específica** — diferente de resposta genérica de IA (hipótese central do discovery)
2. Validar que **recomendações priorizadas geram ação** (usuário executa e volta)
3. Validar **intenção de pagamento** por análise (sem construir cobrança ainda)

### Métricas de sucesso (com alvos propostos para o piloto)

| Métrica | Como medir | Alvo do piloto* |
| --- | --- | --- |
| Conclusão da 1ª análise | funil wizard → resultado | ≥ 70% |
| Diagnóstico avaliado como útil | pesquisa pós-resultado (1–5) | ≥ 4,0 média |
| "Específico, não genérico" | pergunta direta na pesquisa | ≥ 70% "sim" |
| Executou ≥ 1 recomendação | status `concluida` no banco | ≥ 40% |
| Retorno para reanálise | `analysis_versions` criadas | ≥ 25% |
| Intenção de pagamento | pergunta de disposição a pagar + faixa de preço | ≥ 30% "pagaria" |
| Confiança no diagnóstico | nota 1–5 na pesquisa | ≥ 4,0 média |

*Alvos são proposta inicial do time para o piloto (10–30 usuários) — calibrar em conjunto antes do teste.

## 3. Não-objetivos (fora do MVP)

Integração automática com LinkedIn · busca automática de vagas · scraping de plataformas fechadas · mock interview · tracker de candidaturas · dashboard avançado de evolução · B2B (universidades/RHs) · **cobrança implementada** (apenas medição de intenção).

## 4. Personas

Ver [produto.md §2](produto.md#2-personas): Persona A "Recolocação urgente" (operacional/administrativo) e Persona B "Transição de carreira". O tom acolhedor e não-julgador é requisito transversal — a persona chega fragilizada ([Jornada §Fase 0](jornada-usuario.md)).

## 5. Requisitos funcionais

### RF-1 · Estrutura de produto

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-1.1 | Cadastro, login, logout e recuperação de senha | Must | ✅ |
| RF-1.2 | Rotas protegidas; usuário só acessa os próprios dados (RLS) | Must | ✅ |
| RF-1.3 | Dashboard: totais, última análise, pendências, histórico com status | Must | ✅ |
| RF-1.4 | Landing page com promessa, como funciona e aviso de responsabilidade | Must | ✅ |
| RF-1.5 | Responsividade desktop e mobile | Must | ✅ |

### RF-2 · Entrada de materiais (wizard)

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-2.1 | Currículo por upload (PDF/DOC/DOCX/TXT) ou texto colado | Must | ✅ |
| RF-2.2 | LinkedIn por link público, PDF exportado ou texto colado | Must | ✅ |
| RF-2.3 | Cargo-alvo + área + senioridade | Must | ✅ |
| RF-2.4 | "Não sei qual cargo buscar" → sistema **sugere cargos** a partir dos materiais | Should | 🔨 checkbox captura a intenção; geração de sugestões não implementada |
| RF-2.5 | Vaga específica opcional (link, texto ou arquivo) | Must | ✅ |
| RF-2.6 | Arquivos profissionais complementares opcionais | Should | ✅ |
| RF-2.7 | Extração automática de texto de PDF/DOC | Could | 📋 arquivos são armazenados; texto analisado vem do campo colar (decisão registrada em [arquitetura.md §4](arquitetura.md)) |
| RF-2.8 | Revisão pré-envio + processamento com feedback humanizado | Must | ✅ |

### RF-3 · Recomendações + priorização (Funcionalidade 1 do One Page)

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-3.1 | Recomendações classificadas em competência/comunicação/evidência/posicionamento | Must | ✅ |
| RF-3.2 | Priorização por impacto × esforço × urgência + ordem sugerida | Must | ✅ |
| RF-3.3 | Justificativa ("por quê") e ação sugerida em cada recomendação | Must | ✅ |
| RF-3.4 | Filtro por categoria | Must | ✅ |
| RF-3.5 | Marcar como feita (persistente) e copiar sugestão | Must | ✅ |
| RF-3.6 | Coerência currículo × LinkedIn × cargo-alvo apontada nas recomendações | Should | ✅ via prompt (qualidade a validar com IA real) |

### RF-4 · Diagnóstico de aderência (Funcionalidade 2)

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-4.1 | Score 0–100 + nível textual para o cargo-alvo (sempre) | Must | ✅ |
| RF-4.2 | Diagnóstico adicional para vaga específica (quando enviada) | Must | ✅ |
| RF-4.3 | Pontos fortes, lacunas e riscos separados | Must | ✅ |
| RF-4.4 | Distinção lacuna real × comunicação × evidência | Must | ✅ |
| RF-4.5 | Requisitos obrigatórios × desejáveis × inflados da vaga | Should | ✅ via prompt (qualidade a validar com IA real) |
| RF-4.6 | Veredito claro: aplicar agora / com ajustes / desenvolver antes / não priorizar | Must | ✅ |

### RF-5 · Tradução contextual da experiência (Funcionalidade 3 — diferencial)

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-5.1 | Identificar trechos genéricos no material real do usuário | Must | ✅ |
| RF-5.2 | Estrutura: texto original → problema identificado → versão sugerida | Must | ✅ |
| RF-5.3 | Competências implícitas e termos de mercado relacionados | Must | ✅ |
| RF-5.4 | **Alerta de autenticidade em toda sugestão de texto** | Must (inviolável) | ✅ |
| RF-5.5 | Jargões curados por área para precisão terminológica | Should | ✅ Fase 2 implementada: tabela `market_jargons` (10 áreas) injetada no prompt — [docs/ia.md §3](ia.md) |

### RF-6 · Plano de evolução + reanálise (Funcionalidade 4)

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-6.1 | Plano com tipo, prioridade, prazo sugerido e critério de sucesso | Must | ✅ |
| RF-6.2 | Status por ação (pendente/em andamento/concluída) + barra de progresso | Must | ✅ |
| RF-6.3 | Reanálise com wizard pré-preenchido | Must | ✅ |
| RF-6.4 | Comparativo: score anterior → atual, concluídas, lacunas abertas | Must | ✅ |
| RF-6.5 | Histórico de evolução em gráfico (múltiplas reanálises) | Could | 📋 backlog |

### RF-7 · Monetização (hipótese, não construção)

| ID | Requisito | Prioridade | Status |
| --- | --- | --- | --- |
| RF-7.1 | Medir **intenção** de pagamento na pesquisa pós-uso (sem cobrar) | Must (validação) | 📋 instrumento de pesquisa a criar |
| RF-7.2 | Cobrança por análise (freemium) | Won't (neste MVP) | 📋 pós-validação |

## 6. Requisitos não-funcionais

| ID | Requisito | Status |
| --- | --- | --- |
| RNF-1 | **Autenticidade (inviolável):** IA nunca inventa experiências/métricas/certificações, nunca promete contratação | ✅ regras no prompt + refletidas no mock; monitorar nos testes reais |
| RNF-2 | Dados por usuário protegidos (RLS em todas as tabelas, bucket privado) | ✅ ([seguranca.md](seguranca.md)) |
| RNF-3 | Textos em pt-BR, tom claro e acolhedor | ✅ |
| RNF-4 | Análise gerada em ≤ 60s com feedback de progresso | ✅ mock instantâneo; validar com IA real |
| RNF-5 | Resposta da IA sempre no schema JSON (structured outputs) | ✅ ([ia.md §2](ia.md)) |
| RNF-6 | LGPD: minimização, exclusão em cascata, sem uso secundário dos dados | ✅ base ([seguranca.md §7](seguranca.md)); termo de uso 📋 |
| RNF-7 | Build validado em CI a cada mudança | ✅ |

## 7. Fluxo do MVP (One Page §Escopo) × estado atual

| # | Passo do fluxo | Status |
| --- | --- | --- |
| 1 | Acessa o produto | ✅ |
| 2 | Envia currículo, LinkedIn, complementares | ✅ |
| 3 | Informa cargo-alvo **ou recebe sugestões** | 🔨 informa ✅ · sugestões 📋 (RF-2.4) |
| 4 | Envia vaga específica (opcional) | ✅ |
| 5 | Recomendações priorizadas | ✅ |
| 6 | Diagnóstico de aderência | ✅ |
| 7 | Tradução contextual | ✅ |
| 8 | Plano de evolução | ✅ |
| 9 | Nova análise **ou pagar por análise completa** | 🔨 reanálise ✅ · pagamento 📋 (RF-7) |

**Leitura executiva:** dos 9 passos do fluxo definido no discovery, 7 estão completos e 2 parciais (sugestão de cargos e monetização — ambos conscientes e priorizados como Should/Won't).

## 8. Hipóteses de validação e experimentos

Da matriz CSD ([One Page §Evidências](one-page.md#evid%C3%AAncias-do-discovery)):

| Suposição a validar | Experimento | Instrumento |
| --- | --- | --- |
| A IA analisa aderência sem ser genérica | Piloto com 10–30 usuários reais + pergunta "foi específico para você?" | Pesquisa pós-resultado 📋 |
| Recomendações priorizadas geram ação | Medir % com ≥1 recomendação concluída em 7 dias | Dados do banco ✅ (instrumentação pronta) |
| Autenticidade aumenta confiança | Nota de confiança + menção espontânea nas entrevistas | Pesquisa + entrevistas 📋 |
| Explicabilidade é diferencial | Comparação cega: análise PeabiruJobs × prompt genérico em chatbot | Baseline §Baseline do One Page 📋 |
| Candidatos pagariam | Pergunta de intenção + faixas de preço (Van Westendorp simplificado) | Pesquisa 📋 |

**Pré-requisito de todos os experimentos:** Fase 1 da IA validada com modelo real ([ia.md](ia.md) — hoje o formato está provado com mock; a qualidade do conteúdo real é o próximo passo).

## 9. Riscos e mitigações

| Risco | Tipo | Mitigação |
| --- | --- | --- |
| Diagnóstico percebido como genérico (maior risco) | Produto | Tradução ancorada em trechos reais do material; jargões por área (Fase 2); teste de baseline cego |
| Dependência de fontes fechadas de vagas | Técnico | MVP usa apenas dados enviados pelo usuário (decisão do discovery, já implementada) |
| Dor intensa mas episódica | Negócio | Hipótese pagamento-por-análise (uso pontual) em vez de assinatura |
| IA real não entregar a qualidade do mock | Técnico/produto | Ciclo de calibração de prompt com currículos do próprio time antes do piloto ([ia.md](ia.md)) |
| Confiança quebrada por alucinação | Produto (crítico) | Regras invioláveis no prompt + structured outputs + alertas de autenticidade + revisão humana no piloto |

## 10. Questões abertas (para o time decidir)

1. Qual recorte de público para o piloto? (proposta: começar pela rede próxima do time, perfis administrativos/operacionais — persona A)
2. Alvos das métricas do §2 estão calibrados?
3. Quando implementar RF-2.4 (sugestão de cargos)? É citado no fluxo do discovery, mas é Should — antes ou depois do piloto?
4. Modelo de monetização a testar primeiro na pesquisa: por análise, pacote ou freemium com limite?
5. Como recrutar os 10–30 usuários do piloto e qual incentivo?

## 11. Critérios de release (piloto de validação)

- [ ] Infra de produção ativa (migration aplicada + variáveis na Vercel) — pendente
- [ ] Fase 1 da IA validada com modelo real em 3–5 currículos do time — pendente
- [ ] Pesquisa pós-resultado criada (utilidade, especificidade, confiança, intenção de pagamento) — pendente
- [ ] Todos os RF "Must" com status ✅ — **atingido** (exceto infra acima)
- [ ] Roteiro do piloto definido (recrutamento, acompanhamento, coleta)
