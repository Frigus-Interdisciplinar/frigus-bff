# Contratos das telas Frigus Mobile (Figma)

As rotas abaixo usam prefixo `/mobile` e exigem `Authorization: Bearer <accessToken>`, exceto autenticação já existente. Os identificadores de `stockProduct` representam lotes do estoque; `stockId` seleciona a geladeira, freezer ou despensa já retornados pelo contexto.

| Node Figma | Tela e dados necessários | Contrato Mobile |
| --- | --- | --- |
| `3763:11130` | Visão geral do estoque: estoques, resumo, contagens por categoria e estado, próximos do vencimento. | `GET /mobile/inventory/home?groupId=` |
| `3763:11220` | Mesma visão geral, com outro conjunto de alimentos/categorias. | `GET /mobile/inventory/home?groupId=` |
| `3763:11040` | Resumo do estoque, abas e itens próximos do vencimento. | `GET /mobile/inventory/home?groupId=` |
| `3763:11311` | Produtos da geladeira, filtros por categoria/busca, quantidade e validade. | `GET /mobile/inventory/products?storagePlace=FRIDGE&category=&q=&page=&size=` |
| `3763:11509` | Mesmo catálogo da geladeira, estado com filtro selecionado. | `GET /mobile/inventory/products?storagePlace=FRIDGE&category=&q=&page=&size=` |
| `3763:11379` | Produtos do freezer e filtros. | `GET /mobile/inventory/products?storagePlace=FREEZER&category=&q=&page=&size=` |
| `3763:11441` | Produtos da despensa e filtros. | `GET /mobile/inventory/products?storagePlace=PANTRY&category=&q=&page=&size=` |
| `3763:10970` | Detalhe do lote: produto, local, saldo, validade e categoria. | `GET /mobile/inventory/stock-products/:id`; movimentações em `GET /mobile/inventory/stock-products/:id/movements` |
| `3763:10999` | Editar validade, quantidade atual e original, categoria, local e nome do alimento. | `PUT /mobile/inventory/stock-products/:id` persiste campos do alimento e do lote atomicamente; alterações de saldo criam movimento `ADJUSTMENT`. |
| `3763:11025` | Confirmação de remoção irreversível do lote. | `DELETE /mobile/inventory/stock-products/:id` |
| `3763:11587` | Receita, ingredientes e modo de preparo; opcionalmente disponibilidade no estoque. | `GET /mobile/recipes/:id?stockId=` |
| `3451:3271` | Feed paginado, grupos por data no app, horário e contador não lido; marcar um/todos como lidos ou limpar o feed. | `GET /mobile/notifications?page=&size=&unreadOnly=`; `PATCH /mobile/notifications/:id/read`; `PATCH /mobile/notifications/read-all`; `DELETE /mobile/notifications` |
| `3451:4331` | Resultado após leitura e processamento da nota fiscal. | `POST /mobile/inventory/receipts/scan`; consulte `GET /mobile/inventory/receipts/:receiptId` e confirme em `POST /mobile/inventory/receipts/:receiptId/confirm`. O contrato aceita conteúdo do QR, não imagem/PDF. |

## Formato de inventário

`GET /mobile/inventory/home` combina o resumo da core-api com os estoques e lotes do grupo. `categoryCounts` e `statusCounts` são calculados a partir dos lotes persistidos; cada lote mantém os campos originais da core-api, inclusive `product`, `productStatus` e `expireDate`.

As rotas de produtos retornam um envelope compatível com paginação Spring (`content`, `totalElements`, `totalPages`, `size`, `number`). `category` também aceita `FISH`, `FROZEN`, `SWEETS`, `CANNED` e `SEASONING`; `storagePlace` aceita `FRIDGE`, `FREEZER`, `PANTRY`, `CABINET` e `SHELF`. A busca por categoria, local, nome, marca e lote é aplicada pela core-api antes da paginação.

O envio de `quantity` na atualização é uma quantidade final, absoluta, e gera uma movimentação `ADJUSTMENT` na mesma transação. `initialQuantity` persiste a quantidade original do lote, definida na criação e alterável pela tela de edição. `DELETE /mobile/notifications` oculta logicamente as notificações atuais do usuário; `PATCH .../read-all` apenas as marca como lidas.
