# TODO — integração BFF e telas web

Este documento separa contratos da core-api que ainda não foram expostos no BFF
das telas web que ainda não existem neste checkout. `/web/domestic/*` permanece
desativado porque retornava estado em memória; não voltar a usar esse contrato.

## Core-api com endpoint, ainda sem adaptador BFF

- **Resumo/contexto de estoque:** `GET /stocks/my-summary` e
  `GET /stocks/active-context` existem na core-api, mas ainda não estão em
  `CoreApiService` nem em `/web/core`.
- **Lista de compras:** expor `/shopping-lists`, itens, sugestões e conclusão,
  com paginação, validação e propagação dos status `204`.
- **Notificações e preferências:** expor `/notifications` e
  `/profile/preferences`, preservando paginação e contratos de leitura.
- **Receitas e ingredientes:** expor leitura, favoritos, disponibilidade e
  sugestões de `/recipes` e consultas de `/ingredients`; manter escrita
  administrativa protegida pela core-api.
- **Convites e papéis de membros:** expor convites por e-mail, aceite e mudança
  de papel. O adaptador atual só adiciona membro pelo `userId`.
- **Produtos por grupo:** expor CRUD de `/groups/:groupId/products` caso a tela
  comercial precise gerenciar catálogo próprio.
- **Comercial:** expor despesas, relatórios mensal/CSV e funcionários em
  `/commercial/groups/:groupId/*`; exportação deve preservar `text/csv`.
## Telas web sem integração neste checkout

O router de `frigus-react-web` contém Login, Cadastro e Recuperação de senha.
Home, estoque, compras, notificações, receitas, família, chat, perfil,
configurações, planos e telas comerciais ainda não existem no frontend atual.
Quando forem adicionadas, conectar aos adaptadores acima e atualizar
`frigus-react-web/docs/services.md`.

## Já disponível

- Login, cadastro, refresh, logout e recuperação de senha em `/web/auth/*`.
- Perfil em `/web/profile`.
- Grupos básicos, estoques, lotes, movimentações, descartes, conversas/mensagens,
  planos e assinaturas em `/web/core`, `/web/plans` e `/web/transactions`.
- Checkout de plano em `/web/transactions/checkout`; não chamar a seleção como
  pagamento concluído sem aguardar o status da transação.
- Os endpoints de resumo, compras, notificações, preferências, receitas,
  convites, comercial e seleção de plano já existem na core-api. A lista acima
  é trabalho de adaptador BFF, não implementação pendente na core-api. Veja
  `frigus-core-api/docs/core-api-todo.md` para lacunas reais da API.

## Regras para os adaptadores

- Preservar UUIDs, IDs numéricos, campos nulos, paginação e status da core-api.
- Validar entrada e resposta com Zod; repassar cookies/autorização e erros reais.
- Não esconder indisponibilidade com fallback para mock ou estado em memória.
- Adicionar cobertura de rota/service ao integrar cada capability.
