# Anúncios empresariais — contratos do MVP

O domínio usa anúncios de produto criados por uma conta `BUSINESS`. Não inclui
segmentação, recomendação ou cobrança. O feed é comum e ordenado pelos anúncios
mais recentes; as impressões e os cliques são contadores agregados, sem deduplicar
usuários nem manter histórico por evento.

## Endpoints da core-api

Todas as rotas requerem autenticação.

| Método e rota | Uso |
| --- | --- |
| `GET /advertisements/mine?page=0&size=20` | Lista os anúncios da empresa autenticada. |
| `POST /advertisements` | Cria anúncio em `DRAFT`. |
| `PUT /advertisements/{id}` | Atualiza dados de anúncio próprio. |
| `PATCH /advertisements/{id}/status` | Publica, pausa ou arquiva. |
| `GET /advertisements/active?page=0&size=20` | Feed comum de anúncios ativos dentro do período. |
| `POST /advertisements/{id}/impressions` | Soma uma impressão a anúncio ativo. |
| `POST /advertisements/{id}/clicks` | Soma um clique a anúncio ativo. |

O payload de criação/edição contém `name`, `productName`, `category`,
`description`, `imageUrl` (HTTPS), `destinationUrl` (HTTPS opcional), `price`
(opcional), `startDate` e `endDate` (opcionais). Os eventos aceitos são enviados
apenas para anúncios ativos e dentro do período de exibição.

Estados e transições: `DRAFT → ACTIVE | ARCHIVED`,
`ACTIVE → PAUSED | ARCHIVED`, `PAUSED → ACTIVE | ARCHIVED`. Um anúncio
arquivado é terminal. Contas não empresariais não podem gerir anúncios.

## Endpoints do BFF

- Web: os mesmos contratos ficam em `/web/core/advertisements/...`.
- Mobile: o feed e os eventos ficam em `/mobile/advertisements/active` e
  `/mobile/advertisements/{id}/impressions|clicks`.

## Frontend

- `/enterprise/ads`: criação de rascunho, edição, publicação, pausa,
  arquivamento e métricas acumuladas por anúncio.
- `/enterprise`: totais persistidos de anúncios ativos, impressões e cliques.
- `/enterprise/views`: detalhamento acumulado por anúncio.
- Início doméstico: exibe até três anúncios ativos e registra impressão na
  renderização e clique quando o usuário abre o destino.

Endpoints para recomendações, anúncios patrocinados segmentados e relatório
histórico por período ficam para uma etapa posterior.
