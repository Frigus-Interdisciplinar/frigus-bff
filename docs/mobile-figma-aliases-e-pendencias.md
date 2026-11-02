# Telas Frigus — aliases, APIs e pendências

O protótipo Frigus tem 60 frames principais. No `frigus-react-web`, eles podem ser abertos a partir da raiz usando `/?alias=<alias>`; o redirecionamento mantém o parâmetro na URL e leva à rota da funcionalidade correspondente. As páginas com autenticação continuam exigindo uma sessão válida.

## Aliases das telas

| Node Figma | `alias` | Rota da aplicação |
| --- | --- | --- |
| `3762:2139` Estoque | `estoque` | `/stock` |
| `3762:2229` Receitas | `receitas` | `/recipe` |
| `3762:2271` Lista de compras | `lista-de-compras` | `/shopping-list` |
| `3762:2326` Home - Chat IA | `chat-ia` | `/chat-ai` |
| `3762:2356` Home - Chat João | `chat-joao` | `/chat` |
| `3762:2384` Home - Chat Família | `chat-familia` | `/chat` |
| `3762:2416` Central de notificações | `notificacoes` | `/notifications` |
| `3762:2465` Central de notificações - Limpa | `notificacoes-limpa` | `/notifications` |
| `3762:2469` Chat IA - Ajuda e suporte | `chat-ia-ajuda` | `/chat-ai` |
| `3762:2507` Estoque - Detalhes do Alimento | `estoque-detalhe-alimento` | `/stock/:id` (primeiro item válido) |
| `3762:2535` Estoque - Editar (Geladeira) | `estoque-editar-geladeira` | `/stock/:id` (primeiro item da geladeira) |
| `4050:4271` Estoque - Editar (Lista de compras) | `estoque-editar-lista-compras` | `/stock/:id` (primeiro item válido) |
| `3762:2561` Estoque - Remover Peito de Frango | `estoque-remover-alimento` | `/stock/:id` (primeiro item válido) |
| `3762:2576` Estoque - Freezer | `estoque-freezer` | `/stock` |
| `3762:2666` Estoque - Despensa | `estoque-despensa` | `/stock` |
| `3762:2757` Alterar senha - Esqueci minha senha | `esqueci-minha-senha` | `/recover-password/step-1` |
| `3762:2770` Home - Hub de conversas | `hub-conversas` | `/chat` |
| `3762:2792` caminho perfil | `caminho-perfil` | `/profile` |
| `3762:2798` Login | `login` | `/login` |
| `3762:2827` Criar Conta | `criar-conta` | `/register` |
| `3762:2859` Home | `home` | `/home` |
| `3762:2932` Ler QR Code | `qr-code` | `/mobile-screen-pending` |
| `3762:2938` Ler QR Code - Carregando | `qr-code-carregando` | `/mobile-screen-pending` |
| `3762:2947` Ler QR Code - Itens da nota fiscal | `qr-code-itens` | `/mobile-screen-pending` |
| `3762:2989` Ler QR Code - Confirmação | `qr-code-confirmacao` | `/mobile-screen-pending` |
| `3762:3011` MoneySaving - Gastos com alimentação | `gastos-alimentacao` | `/mobile-screen-pending` |
| `3762:3068` MoneySaving - Economia e desperdício | `economia-desperdicio` | `/mobile-screen-pending` |
| `3762:3119` MoneySaving - Histórico financeiro | `historico-financeiro` | `/mobile-screen-pending` |
| `3762:3195` MoneySaving - Detalhes dos gastos | `detalhes-gastos` | `/mobile-screen-pending` |
| `3762:3236` MoneySaving - Detalhes da economia | `detalhes-economia` | `/mobile-screen-pending` |
| `3762:3277` MoneySaving - Filtros | `filtros-financeiros` | `/mobile-screen-pending` |
| `3762:3307` Perfil - Minha família | `familia` | `/family-members` |
| `3762:3329` Perfil - Convidar membro | `convidar-membro` | `/family-members` |
| `3762:3345` Perfil - Alterar plano | `alterar-plano` | `/plans` |
| `3762:3414` Perfil - Assinatura e planos | `assinatura-planos` | `/plans` |
| `3762:3456` Perfil - Pagamento | `pagamento` | `/checkout` |
| `3762:3479` Perfil - Pagamento realizado | `pagamento-realizado` | `/checkout/webview/success` |
| `3762:3512` Perfil - Gerenciar plano | `gerenciar-plano` | `/plans` |
| `3762:3539` Perfil - Forma de pagamento | `forma-de-pagamento` | `/checkout` |
| `3762:3557` Perfil - Cancelar assinatura | `cancelar-assinatura` | `/plans` |
| `3762:3574` MoneySaving - Visão geral | `visao-geral-financeira` | `/mobile-screen-pending` |
| `3762:3640` MoneySaving - Como os valores são calculados | `como-valores-calculados` | `/mobile-screen-pending` |
| `3762:3660` caminho plano | `caminho-plano` | `/plans` |
| `3762:3664` Perfil | `perfil` | `/profile` |
| `3762:3707` Perfil - Ajuda e suporte | `ajuda-e-suporte` | `/settings` |
| `3762:3775` Perfil - Adicionar cartão | `adicionar-cartao` | `/checkout` |
| `3762:3803` Estoque - Categorias (Geladeira) | `categorias-geladeira` | `/stock` |
| `3762:3871` Estoque - Categorias (Freezer) | `categorias-freezer` | `/stock` |
| `3762:3933` Estoque - Categorias (Despensa) | `categorias-despensa` | `/stock` |
| `3762:4112` Receita - Detalhes da receita | `detalhe-da-receita` | `/recipe/1` |
| `3762:4160` Configurações - Preferências de alimentos | `preferencias-de-alimentos` | `/settings` |
| `3762:4195` Configurações - Unidades e medidas | `unidades-e-medidas` | `/settings` |
| `3762:4225` Configurações - Dispositivos conectados | `dispositivos-conectados` | `/settings` |
| `3762:4245` Configurações - Privacidade | `privacidade` | `/settings` |
| `3762:4270` Configurações - Alterar senha | `alterar-senha` | `/settings` |
| `3762:4296` Configurações - Informações da Conta | `informacoes-da-conta` | `/profile` |
| `3762:4314` Configurações - Verificação de e-mail | `verificacao-de-email` | `/profile` |
| `3762:4322` Configurações | `configuracoes` | `/settings` |
| `3762:4369` Ajuda e suporte - Enviar uma solicitação | `ajuda-enviar-solicitacao` | `/settings` |
| `3821:4496` Lista de compras - Adicionar item | `adicionar-item-lista` | `/shopping-list` |

## Contratos BFF disponíveis

Todas as rotas abaixo exigem `Authorization: Bearer <accessToken>`.

O Chat IA do web usa `POST /web/core/ai/recipes/chat` no BFF, que encaminha a chamada autenticada para `POST /ai/recipes/chat` na core-api. A core-api integra com o serviço `frigus-ai`.

| Fluxo | Rotas mobile |
| --- | --- |
| Estoque, filtros, categorias, detalhes, edição e remoção | `GET /mobile/inventory/home`; `GET /mobile/inventory/products`; `GET /mobile/inventory/stocks/:stockId/products`; `GET/PUT/DELETE /mobile/inventory/stock-products/:id`; `GET/POST /mobile/inventory/stock-products/:id/movements` |
| Receitas e favoritos | `GET /mobile/recipes?q=&page=&size=`; `GET /mobile/recipes/favorites`; `GET /mobile/recipes/suggestions?stockId=&limit=`; `GET /mobile/recipes/:id?stockId=`; `PUT/DELETE /mobile/recipes/:id/favorite` |
| Chat IA (web e mobile) | Web: `POST /web/core/ai/recipes/chat`; mobile: `POST /mobile/recipes/ai/chat`, ambos com `{ message, stockId, sessionId? }`. Sugestões mobile: `GET /mobile/recipes/ai/suggestions/:stockId`. |
| Notificações | `GET /mobile/notifications?page=&size=&unreadOnly=`; `PATCH /mobile/notifications/:id/read`; `PATCH /mobile/notifications/read-all`; `DELETE /mobile/notifications` |

Listas de compra, conversas, perfil, preferências, família, pagamentos e assinatura já têm contratos na API web do BFF (`/core/...`), que chama a core-api. A tela web pode reutilizar esses contratos; não foi duplicada uma segunda implementação mobile sem diferença de comportamento.

## O que ainda falta

- [ ] **Conectar aliases às telas Figma completas.** Os aliases acima levam à rota funcional existente, mas aliases que compartilham página não selecionam ainda o estado específico do frame (por exemplo, filtro de Freezer, modal de edição, conversa individual ou estado vazio). IDs `/stock/1` e `/recipe/1` são apenas exemplos; precisam ser trocados por IDs reais selecionados pelo usuário.
- [ ] **Implementar QR / nota fiscal de ponta a ponta.** Os quatro aliases QR hoje apontam para Home; a core-api não recebe imagem/PDF/QR nem fornece estado de processamento. Criar upload, leitura, revisão de itens, confirmação e persistência antes de ligar essas telas.
- [ ] **Implementar telas MoneySaving.** As seis telas financeiras hoje apontam para Home. A core-api não possui contratos para gastos com alimentação, economia, histórico, filtros nem cálculo detalhado. O repositório de IA tem ferramentas/repositórios financeiros para respostas conversacionais, mas isso não substitui uma API tipada de dashboard/histórico.
- [ ] **Completar o Chat IA ponta a ponta.** O web já tem uma tela de chat autenticada pelo BFF e usa o endpoint de receitas da core-api. O cliente da core-api foi alinhado às rotas `/v1/chats` e ao corpo `{ content }` do `frigus-ai`. A tela ainda usa resposta completa sem streaming e não recupera histórico do chat ao reabrir; o contrato de receitas da core-api também exige revisão para evitar persistir uma receita quando a resposta é apenas conversacional.
- [ ] **Validar assinatura/checkout no contexto mobile.** A API web já tem contratos de planos, assinatura e transações; conferir estados necessários nas telas Figma e os meios de pagamento habilitados no ambiente de produção.
- [ ] **Ligar telas de configuração e conta a ações explícitas.** Preferências têm contrato (`/core/preferences`); unidades, dispositivos conectados, privacidade e verificação de e-mail não têm fluxo completo confirmado para esses frames.

## Limites desta entrega

O parâmetro `alias` serve como ponto de entrada por tela e mantém o alias após o redirecionamento. O web abre o Chat IA em `/chat-ai`, com chamadas autenticadas passando pelo BFF e pela core-api. QR e MoneySaving continuam na página de pendências por falta de contratos upstream; ainda falta concluir o streaming e a recuperação do histórico do Chat IA, além dos estados visuais exatos das variantes do Figma.
