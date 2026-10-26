# Contratos de tela do Frigus Web

| Fluxo/tela | Estado neste checkout | Contrato BFF |
| --- | --- | --- |
| Cadastro, login e recuperação | Ligado. O cadastro escolhe doméstico, comercial ou empresarial (`BUSINESS`) e provisiona grupo/estoque. | `/web/auth/*`, `/web/core/groups`, `/web/core/inventory/*` |
| Início doméstico | Resumo da API para totais, alertas, consumo e estoque. Alguns gráficos decorativos ainda são ilustrativos. | `/web/core/inventory/summary` |
| Estoque doméstico e inclusão de produto/lote | Ligado à persistência. Cria produto próprio no grupo e lote no estoque. | `/web/core/groups/:id/products`, `/web/core/inventory/*` |
| Lista doméstica de compras | Ligada para lista aberta, itens, status de compra, remoção e sugestões. | `/web/core/shopping-lists*` |
| Configurações e notificações | Preferências e feed de notificações ligados. Controles de canal que não existem no contrato não devem ser tratados como persistidos. | `/web/core/preferences`, `/web/core/notifications*` |
| Perfil e membros da família | Perfil, foto, senha, preferências, notificações, membros e convites usam contratos persistidos. | `/web/profile`, `/web/core/preferences`, `/web/core/notifications*`, `/web/core/groups*` |
| Alertas e telas comerciais | Alertas usam lotes reais; estoque, compras, descarte, despesas, relatórios mensais e equipe gravam/consultam dados persistidos. | `/web/core/inventory/*`, `/web/core/discards`, `/web/core/commercial/groups/:groupId/*` |
| Receitas e favoritas | Catálogo, busca, sugestões, detalhe, disponibilidade dos ingredientes e favoritas usam dados da API. | `/web/core/recipes*` |
| Chat e detalhes de lote comercial | Chat lista conversas, busca mensagens, envia texto/anexos, registra reações e exibe detalhes/movimentações dos lotes. | `/web/core/chat/*`, `/web/core/inventory/stock-products/:id*` |
| Plano e checkout de assinatura | Frontend inicia checkout, acompanha/cancela transações pendentes e consulta/gerencia assinatura. O processador é demonstrativo; não cobra nem emite PIX/boleto real. Pacotes empresariais não têm contrato de compra. | `/web/core/plans`, `/web/core/transactions/*` |
| Estoque, compras, desperdício, despesas, relatórios e equipe comerciais | Telas gravam/listam dados no inventário, listas, descarte, despesas e relatórios. Membros/convites e permissões de leitura/edição também usam a API. | `/web/core/inventory/*`, `/web/core/shopping-lists*`, `/web/core/discards`, `/web/core/commercial/groups/:groupId/*` |
| Painel empresarial e anúncios | Gestão, publicação e métricas agregadas usam a API; recomendação e segmentação não fazem parte do MVP. | `/web/core/advertisements/*`, `/mobile/advertisements/*` |

## Anúncios empresariais (MVP)

- Painel próprio: `GET /web/core/advertisements/mine` lista anúncios da conta
  empresarial autenticada; `POST` cria rascunho, `PUT /:id` edita e
  `PATCH /:id/status` publica, pausa ou arquiva.
- Entrega no app: `GET /web/core/advertisements/active` (Web) e
  `GET /mobile/advertisements/active` (Mobile) retornam anúncios ativos dentro
  do período, em ordem de criação, sem seleção personalizada. Impressões e
  cliques são registrados em `POST /:id/impressions` e `POST /:id/clicks`.
- A core-api persiste os anúncios em `advertisements`, restringe a gestão a
  contas empresariais e calcula métricas agregadas por anúncio.
- O MVP não inclui recomendações, segmentação de público, moderação, cobrança
  ou atribuição de pedidos.

`/web/domestic/*` foi desativado: retornava estado em memória. As telas devem
usar os contratos tipados sob `/web/core`, que repassam autenticação e respostas
da core-api.
