# Estado de integração web, BFF e core-api

## Fluxos ligados

- Cadastro, seleção de conta (`DOMESTIC`, `COMMERCIAL`, `BUSINESS`), login,
  sessão por cookie HttpOnly, renovação, logout e recuperação de senha.
- A opção “Manter conectado” controla a persistência do cookie de refresh e é
  preservada durante a renovação da sessão.
- Provisionamento do primeiro grupo/estoque para contas novas e inventário
  doméstico: contexto, resumo, produtos próprios, lotes e movimentações.
- Lista de compras: listar/criar lista, adicionar/alterar/remover itens, marcar
  compra, sugestões e limpar comprados.
- Notificações e preferências da conta.
- BFF expõe grupos, convites, receitas, conversas, anúncios, produtos por grupo,
  despesas comerciais, relatórios mensais e funcionários às telas integradas.

## Limites e itens ainda fora da integração

- Detalhe/edição de lote e histórico de movimentações agora usam o inventário
  real. Alertas domésticos derivam dos lotes; descarte usa o contrato BFF.
- Chat, conversas e envio de mensagens agora usam a API. Algumas ações de perfil
  ainda mantêm estados locais. Catálogo,
  detalhe, sugestões e favoritas de receitas usam a API. Convites familiares
  também usam a API.
- Tela de assinatura usa a API de transações, mas somente com o processador de
  demonstração. Falta consultar/gerenciar a assinatura na interface e integrar
  um adquirente real.
- Estoque, compras, desperdícios, despesas, relatórios, equipe, convites e
  permissões comerciais já estão ligados a endpoints persistidos.
- Painel empresarial com anúncios próprios, publicação/pausa/arquivamento,
  entrega dos anúncios ativos e contagem de impressões/cliques agora está ligado
  a dados persistidos. Audiência segmentada, recomendação, moderação e cobrança
  de anúncios continuam fora deste MVP.

## Lacunas de backend

- Anúncios: falta definir a política comercial de cobrança e moderação. A
  persistência, autorização, status e métricas básicas já existem na core-api.
- O fluxo local de recuperação de senha exige credenciais Brevo válidas para
  efetivamente entregar e-mail; health check não valida esse serviço externo.
- O checkout atual registra transação pelo processador implementado na API; não
  há integração de adquirente de cartão/PIX neste checkout web.

## Contratos

As rotas web sob `/web/core` adaptam contratos existentes e são protegidas pelo
cookie/token da sessão. `/web/domestic/*` continua desativado, pois era estado em
memória. Veja `frontend-screen-contract.md` para mapeamento de telas e rotas.
