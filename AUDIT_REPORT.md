# Relatório de auditoria do BFF

Data: 2026-10-31  
Branch: `feat/audit`

## Escopo

Auditoria de segurança, validação de entrada, contratos HTTP e robustez do BFF Hono + TypeScript. O trabalho cobre o BFF e os contratos do Core API usados diretamente por seus serviços; não é um teste de intrusão nem uma auditoria completa do Core API.

## Estado inicial e validação final

No início, `npx tsc --noEmit` passou. Os scripts `npm run typecheck` e `npm test` ainda não existiam. Os verificadores já existentes passaram para utilitários, mas dois verificadores antigos falharam por expectativas divergentes do comportamento atual: o teste de serviços esperava HTTP 400 antes da proteção de Origin, que corretamente respondeu 403; o teste doméstico esperava 401 para uma rota cuja implementação devolve 501. O teste doméstico foi atualizado para documentar o contrato implementado.

Ao final, passaram:

- `npm run typecheck`
- `npm test` (verificadores de utilitários, serviços/Core API e rota doméstica)
- `git diff --check`

## Achados mitigados

| Área | Risco observado | Mitigação aplicada |
| --- | --- | --- |
| Cabeçalhos e payloads HTTP | Ausência de uma camada comum de cabeçalhos de segurança e limite global de corpo. | `secureHeaders`, CSP, HSTS em produção, proteção contra MIME sniffing e framing, política de referrer; limite de corpo de 1 MiB. |
| CORS e origem | Configuração de origem permissiva ou inválida poderia ampliar a superfície de chamadas cross-origin. | `WEB_ORIGINS` aceita apenas origens HTTP(S) exatas; rejeita curingas e caminhos. CORS usa a lista validada e credenciais explícitas. As rotas web de escrita preservam a verificação de Origin contra CSRF. |
| Autenticação pública | Login e cadastro não tinham limitação de tentativas no BFF. | Limitador por IP, método e caminho para login/cadastro web e mobile, com janela e mapa limitados, `Retry-After` e resposta 429. O IP encaminhado só é confiado quando `TRUST_PROXY=true`. |
| Proxy móvel para Core API | O proxy genérico não exigia autenticação e permitia encaminhamento de cabeçalhos/métodos e cookies upstream sem filtragem suficiente. | Exige bearer token válido; limita métodos e tamanho; valida caminho, query e corpo JSON; usa cabeçalhos permitidos; não repassa `Set-Cookie` do upstream. |
| Identidade de requisição | Não havia ID consistente entre resposta e chamadas upstream. | Middleware valida ou cria `X-Correlation-ID`, responde com esse ID e o propaga via `AsyncLocalStorage`. |
| Erros e tokens | Erros upstream e tokens Bearer malformados podiam produzir comportamento inconsistente ou expor detalhe interno. | Parsing Bearer estrito; respostas 4xx filtradas; falhas upstream 5xx e respostas inválidas usam mensagens genéricas; logs não incluem stack ou mensagem do erro. |
| Contratos upstream | Respostas confiáveis apenas por tipos TypeScript podiam divergir do JSON recebido em runtime. | Cliente HTTP valida respostas com Zod; adaptadores do Core API declaram schemas para os contratos mapeados. Resposta inválida falha de forma controlada. |
| Entrada e paginação | Vários endpoints aceitavam paginação, IDs, filtros e ordenação sem limites ou validação coerente. | Limites de paginação/filtros, validação de UUID, enum, data, e-mail e `Idempotency-Key` nos canais web e mobile. |
| Fanout de inventário | Busca agregada podia fazer muitas chamadas em série ou processar volume sem teto. | Concorrência limitada a quatro chamadas, páginas em lotes e teto de 100 páginas por estoque; excedente retorna orientação 422. |
| Cookies de sessão | Flags e caminhos de cookies não estavam alinhados ao ambiente e às rotas. | Cookies HttpOnly e SameSite Lax, Secure em produção, caminhos limitados às rotas web e exclusão com os mesmos atributos. |
| Configuração | Porta, timeout e origens não tinham validação/bounds adequados. | Schema de ambiente valida inteiros positivos dentro dos limites, `TRUST_PROXY` booleano explícito e origens exatas. |

## Schemas e contratos adicionados ou reforçados

- **Auth e perfil:** respostas de login, registro e perfil validadas por Zod; data de nascimento aceita `null` conforme o contrato legado.
- **Core API:** páginas; grupos e membros (normalizando `memberRole` para `role`); stocks e contexto ativo; produtos e produtos em estoque; resumo de estoque; anúncios; notificações e contagem não lida; movimentos; receitas e disponibilidade; conversas, mensagens e reações; recibos e confirmação de importação; limites de plano.
- **Entrada das rotas:** paginação e tamanho com bounds, IDs UUID, status/enums, datas e filtros validados; corpo do proxy móvel limitado e validado como JSON.
- Os adaptadores com DTOs mapeados usam schemas específicos. Endpoints encaminhados pelo proxy genérico ou sem DTO tipado local ainda recebem validação JSON genérica, que confirma JSON válido, mas não substitui um schema de domínio por endpoint.

## Arquivos alterados

- **Aplicação e configuração:** `src/app.ts`, `src/config/env.ts`, `README.md`, `package.json`.
- **Middlewares:** `src/middlewares/auth.middleware.ts`, `src/middlewares/error-handler.middleware.ts`, `src/middlewares/index.ts`, `src/middlewares/public-auth-rate-limit.middleware.ts` (novo), `src/middlewares/request-context.middleware.ts` (novo).
- **Mobile:** `src/channels/mobile/advertisements/advertisements.route.ts`, `src/channels/mobile/commercial/commercial.route.ts`, `src/channels/mobile/core/core-proxy.route.ts`, `src/channels/mobile/home/home.route.ts`, `src/channels/mobile/index.ts`, `src/channels/mobile/inventory/inventory.route.ts`, `src/channels/mobile/notifications/notifications.route.ts`, `src/channels/mobile/recipes/recipes.route.ts`, `src/channels/mobile/shopping-list/shopping-list.route.ts`, `src/channels/mobile/user/user.route.ts`.
- **Web:** `src/channels/web/auth/auth.route.ts`, `src/channels/web/core/core.route.ts`, `src/channels/web/domestic/domestic.route.ts`, `src/channels/web/index.ts`, `src/channels/web/plan/plan.route.ts`, `src/channels/web/profile/profile.route.ts`, `src/channels/web/transaction/transaction.route.ts`, `src/channels/web/user/user.route.ts`.
- **Schemas, tipos e serviços:** `src/schemas/auth.schema.ts`, `src/schemas/index.ts`, `src/schemas/user.schema.ts`, `src/schemas/core-api-response.schema.ts` (novo), `src/types/api-client.type.ts`, `src/types/core-api.type.ts`, `src/types/user.type.ts`, `src/services/auth.service.ts`, `src/services/core-api.service.ts`, `src/services/domestic.service.ts`, `src/services/message-attachment.service.ts`, `src/services/profile.service.ts`, `src/services/transaction.service.ts`, `src/services/user.service.ts`, `src/utils/api-client.ts`.
- **Verificadores existentes ajustados:** `src/utils/__tests__/verify-domestic.ts`, `verify-services.ts`, `verify-utils.ts`.
- **Ambiente:** `.env.production.example` já era um arquivo não rastreado antes da auditoria e foi preservado; não foi criado como parte das correções.

## Limitações operacionais

O rate limit atual é em memória e vale por processo. Em deploy com múltiplas instâncias, é necessário usar armazenamento compartilhado para uma quota global. `TRUST_PROXY` deve permanecer desligado a menos que a aplicação esteja atrás de um proxy confiável que remova cabeçalhos encaminhados pelo cliente e defina os seus próprios. O proxy móvel preserva a compatibilidade genérica do Core API; endpoints sem contrato específico no BFF continuam cobertos apenas pela validação de JSON.

## Alterações preexistentes preservadas

O workspace já tinha alterações em `src/channels/web/profile/profile.route.ts`, `src/services/auth.service.ts` e `src/services/profile.service.ts`, além do `.env.production.example` não rastreado. As mudanças anteriores foram preservadas e integradas quando compatíveis com a auditoria. Em particular, a rota de onboarding de tipo de conta já estava presente no estado inicial e foi mantida; este relatório não a atribui como nova implementação de segurança.
