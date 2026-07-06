# 🔒 Segurança

> Modelo de segurança do PeabiruJobs: autenticação, autorização, dados sensíveis e conformidade.

## 1. Princípios

1. **Defesa em profundidade:** middleware (rota) + RLS (dados) + policies de Storage (arquivos) — burlar uma camada não expõe as outras
2. **Menor privilégio:** o app usa apenas a chave *publishable*; a `service_role` **não é usada em lugar nenhum**
3. **Dados do usuário pertencem ao usuário:** todo acesso é filtrado por `auth.uid()`

## 2. Autenticação e sessão

- **Supabase Auth** com e-mail/senha; senhas com hash bcrypt gerenciado pela plataforma
- **Sessão em cookies httpOnly** via `@supabase/ssr` — o token não é acessível por JavaScript (mitiga XSS de roubo de sessão)
- **Middleware** renova a sessão a cada request e redireciona não autenticados das rotas protegidas (`/dashboard`, `/nova-analise`, `/analise`, `/reanalise`, `/configuracoes`)
- Recuperação de senha por link mágico com troca de código no `auth/callback`

## 3. Autorização — Row Level Security

RLS habilitado em **todas** as tabelas. Padrões:

| Tabela | Política |
| --- | --- |
| `user_profiles`, `career_analyses`, `user_documents`, `analysis_versions` | `auth.uid() = user_id` (USING + WITH CHECK) |
| `recommendations`, `fit_diagnostics`, `evolution_plans` | `analysis_id IN (SELECT id FROM career_analyses WHERE user_id = auth.uid())` |

**Consequência prática:** mesmo com a anon key pública (ela vai no bundle do navegador, por design), um usuário autenticado só lê/escreve os próprios registros. Sem sessão, nada é acessível.

## 4. Storage

- Bucket `documents` **privado** (sem URLs públicas)
- Policy por pasta: o usuário só acessa `documents/{seu_user_id}/…`
- Nomes de arquivo sanitizados no upload + prefixo UUID (evita colisão e path traversal)

## 5. Segredos e chaves

| Chave | Classificação | Regra |
| --- | --- | --- |
| Anon/publishable key | Pública | Pode ir ao cliente; RLS é a proteção |
| `ANTHROPIC_API_KEY` | **Secreta** | Só server-side; nunca `NEXT_PUBLIC_`; nunca no repositório |
| `service_role` key | **Crítica** | Não usada no projeto; se algum dia for, só em server + vault |
| Personal Access Token do Supabase (`sbp_…`) | **Crítica** | Uso pontual de gestão; **revogar após o uso** (Account → Access Tokens) |

⚠️ **Ação pendente:** o token `sbp_…` compartilhado durante o setup desta PoC deve ser **revogado** no painel do Supabase.

`.gitignore` bloqueia `.env*` — variáveis vivem só na Vercel e no `.env.local` de cada dev.

## 6. Superfície de ataque e mitigações

| Ameaça | Mitigação atual | Evolução sugerida |
| --- | --- | --- |
| Acesso a dados de outro usuário (IDOR) | RLS em todas as tabelas; rotas buscam por id **e** sessão | Testes automatizados de RLS |
| XSS | React escapa por padrão; sem `dangerouslySetInnerHTML`; cookies httpOnly | CSP headers |
| Injeção de prompt via materiais do usuário | System prompt com regras fixas; structured outputs limitam a saída ao schema | Sanitização/limite de tamanho dos textos de entrada |
| Abuso de custo de IA | `AI_PROVIDER=mock` por padrão; geração exige autenticação | Rate limiting por usuário (ex.: Upstash) e cota de análises |
| Upload malicioso | Bucket privado, sem execução, nome sanitizado | Validação de MIME/extensão e limite de tamanho no cliente e na policy |
| Enumeração de e-mails | Mensagem neutra na recuperação de senha | Rate limiting no auth (nativo do Supabase) |

## 7. LGPD — dados pessoais tratados

| Dado | Finalidade | Base |
| --- | --- | --- |
| Nome, e-mail | Conta e comunicação | Execução de contrato |
| Currículo, LinkedIn, documentos | Geração da análise (finalidade única) | Execução de contrato |
| Análises e progresso | Histórico e comparativos do próprio usuário | Execução de contrato |

**Direitos do titular no design atual:**

- **Exclusão:** apagar o usuário no Supabase remove tudo em cascata (`ON DELETE CASCADE` em todas as tabelas); arquivos do Storage devem ser removidos junto (roadmap: rotina de limpeza)
- **Acesso/portabilidade:** dados exportáveis via painel (roadmap: exportação self-service)
- **Minimização:** nenhum dado é usado para outra finalidade; nada é compartilhado com terceiros além do provider de IA quando ativado (documentar no termo de uso)

**Roadmap de conformidade:** termo de uso + política de privacidade, exclusão de conta self-service (incluindo Storage), registro de consentimento.
