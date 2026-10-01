# Contratos do BFF a partir das telas

O frontend foi analisado antes da implementação. As telas não chamam a API além de autenticação; elas mantêm listas e ações em estado local. Este documento é a ponte para retirar esses mocks sem criar dados inexistentes no BFF.

| Tela | Dados e ações vistos na interface | Contrato BFF disponível |
| --- | --- | --- |
| Login e cadastro | login, cadastro, refresh e logout | `POST /web/auth/login`, `/register`, `/refresh`, `/logout` |
| Perfil e configurações de conta | consultar, editar perfil, senha e exclusão | `GET|PUT|PATCH|DELETE /web/profile`, `PATCH /web/profile/password` |
| Planos | catálogo, assinatura atual, cancelamento/reativação e checkout | `GET /web/plans`, `GET|POST /web/plans/subscription*`, `POST /web/transactions/checkout` |
| Família | grupos, membros e convite por usuário já existente | `GET|POST /web/core/groups`, `GET|PUT /web/core/groups/:id`, `POST|DELETE /web/core/groups/:id/members` |
| Estoque doméstico e comercial | estoques por grupo, lotes/produtos, edição e movimentação | `/web/core/inventory/groups/:groupId/stocks`, `/stocks`, `/stocks/:id/products`, `/stock-products`, `/stock-products/:id/movements` |
| Detalhe de alimento/lote | produto do estoque e histórico de movimentações | `GET|PUT /web/core/inventory/stock-products/:id`, `GET|POST /web/core/inventory/stock-products/:id/movements` |
| Chat | conversas, histórico e envio de mensagem | `/web/core/chat/conversations` e `/web/core/chat/conversations/:id/messages` |
| Desperdícios (comercial) | histórico e registro de descarte | `GET|POST /web/core/discards` |
| Inclusão de produto em lote | catálogo de produtos da core-api | `GET /web/plans/catalog/products` |

## Migração importante

`/web/domestic/*` foi desativado: ele respondia com dados em memória e não persistia nada. Agora responde `501` de propósito. Migre as telas para `/web/core/*`; os contratos foram mantidos como adaptadores tipados e validados dos endpoints já existentes na core-api.

## Telas ainda sem integração no frontend

Home, Estoque, Detalhe de alimento, Alertas, Receitas, Lista de compras, Notificações, Família, Chat, Perfil, Configurações, Planos e todas as telas comerciais ainda usam arrays/objetos locais ou ações visuais. A tabela indica o que já pode ser conectado; as lacunas da core-api estão em `docs/core-api-todo.md`.
