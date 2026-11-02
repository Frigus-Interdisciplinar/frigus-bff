# Mapa das telas mobile e contratos BFF

## Escopo do Figma

O texto de entrada tem **136 referências**: **115 frames** em duas versões de plano e **21 nós de conteúdo/componentes**. Os frames incluem telas repetidas entre Doméstico e Comercial; os contratos abaixo são compartilhados quando o fluxo é o mesmo. O pedido de produto reserva MoneySaving para contas comerciais, então a fachada nova restringe esse módulo ao tipo de conta comercial e a um plano com entitlement habilitado.

O arquivo contém duas versões principais: *Doméstico - Design Mobile V2* e *Comercial - Design Mobile V2*. As telas MoneySaving aparecem na seção visual Doméstico; o mapa reutiliza a família para a jornada comercial sem criar uma segunda cópia de contrato.

## Regras de consumo

- Prefixo mobile: `/mobile`; envie `Authorization: Bearer <accessToken>` em chamadas protegidas.
- Para operações do Core sem agregação mobile específica, use `/mobile/core/{caminho-original-do-Core}`; os corpos, query strings e respostas são listados em [mobile-core-api-contract.md](mobile-core-api-contract.md).
- Home e MoneySaving usam endpoints de tela explícitos abaixo. Os contratos de request/response completos, parâmetros e formatos estão detalhados após as tabelas.
- `—` significa tela de estado/diálogo, validação local ou navegação que não inicia uma requisição por si só.

## Inventário por frame do Figma

| Plano | Frame | Tela | Contrato e ação de UI | Estado |
|---|---|---|---|---|
| Doméstico | [4099:5841](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-5841) | Estoque | GET `/mobile/inventory/home?groupId` para resumo; usar o filtro `storagePlace` para a lista. | Existe |
| Doméstico | [4099:5913](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-5913) | Receitas | GET `/mobile/recipes?page&size&q`; GET `/favorites`; GET `/suggestions?stockId&limit`. | Existe |
| Doméstico | [4099:5947](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-5947) | Lista de compras | GET `/mobile/core/shopping-lists?stockId&page&size&status`; POST lista e GET suggestions. | Existe |
| Doméstico | [4099:5991](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-5991) | Home - Chat IA | GET `/mobile/recipes/ai/suggestions/{stockId}`; POST `/mobile/recipes/ai/chat`. | Existe |
| Doméstico | [4099:6021](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6021) | Home - Chat João | GET `/mobile/core/conversations`; GET/POST `/conversations/{id}/messages`; GET/PUT/DELETE `/messages/{messageId}/reactions`; POST `/messages/{messageId}/read`; DELETE `/conversations/{id}/leave`. | Existe via proxy |
| Doméstico | [4099:6049](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6049) | Home - Chat Família | GET `/mobile/core/conversations`; GET/POST `/conversations/{id}/messages`; GET/PUT/DELETE `/messages/{messageId}/reactions`; POST `/messages/{messageId}/read`; DELETE `/conversations/{id}/leave`. | Existe via proxy |
| Doméstico | [4099:6081](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6081) | Central de notificações | GET `/mobile/notifications?page&size&unreadOnly`; PATCH `/{id}/read`, PATCH `/read-all`, DELETE `/`. | Existe |
| Doméstico | [4099:6130](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6130) | Central de notificações - Limpa | GET `/mobile/notifications?page&size&unreadOnly`; PATCH `/{id}/read`, PATCH `/read-all`, DELETE `/`. | Existe |
| Doméstico | [4099:6134](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6134) | Home - ChatIA Ajuda e suporte | FAQ pode ser conteúdo estático; tickets: POST `/mobile/core/support/requests`, GET `/support/requests`. | Novo Core via proxy |
| Doméstico | [4099:6172](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6172) | Estoque - Detalhes do Alimento | GET `/mobile/inventory/stock-products/{id}`. | Existe |
| Doméstico | [4099:6202](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6202) | Lista de compras - Editar Peito de Frango | PATCH `/mobile/core/shopping-lists/{listId}/items/{itemId}`. | Existe |
| Doméstico | [4099:6226](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6226) | Estoque - Editar Peito de Frango | PUT `/mobile/inventory/stock-products/{id}`. | Existe |
| Doméstico | [4099:6253](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6253) | Estoque - Remover Peito de Frango | DELETE `/mobile/inventory/stock-products/{id}`; confirmar no app antes de enviar. | Existe |
| Doméstico | [4099:6270](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6270) | Estoque - Freezer | GET `/mobile/inventory/home?groupId` para resumo; usar o filtro `storagePlace` para a lista. | Existe |
| Doméstico | [4099:6343](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6343) | Estoque - Despensa | GET `/mobile/inventory/home?groupId` para resumo; usar o filtro `storagePlace` para a lista. | Existe |
| Doméstico | [4099:6419](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6419) | Alterar senha - Esqueci minha senha | POST `/mobile/core/auth/forgot-password`; POST `/mobile/core/auth/verify-reset-code`; POST `/mobile/core/auth/reset-password`. | Existe |
| Doméstico | [4099:6430](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6430) | Home - Hub de conversas | GET `/mobile/core/conversations`; GET/POST `/conversations/{id}/messages`; GET/PUT/DELETE `/messages/{messageId}/reactions`; POST `/messages/{messageId}/read`; DELETE `/conversations/{id}/leave`. | Existe via proxy |
| Doméstico | [4099:6453](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6453) | caminho perfil | Fluxo de navegação no protótipo; sem chamada de API. | UI |
| Doméstico | [4099:6459](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6459) | Login | POST `/mobile/user/login`; Google: POST `/mobile/core/auth/google`. | Email pronto; login por telefone depende de SMS/OTP |
| Doméstico | [4099:6489](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6489) | Criar Conta | POST `/mobile/user/register`. | Existe |
| Doméstico | [4099:6521](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6521) | Home | GET `/mobile/home?groupId`. | Novo BFF |
| Doméstico | [4099:6584](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6584) | Ler QR Code | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Doméstico | [4099:6593](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6593) | Ler QR Code - Carregando | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Doméstico | [4099:6602](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6602) | Ler QR Code - Itens da nota fiscal | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Doméstico | [4099:6644](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6644) | Ler QR Code - Confirmação | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Doméstico | [4099:6654](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6654) | MoneySaving - Gastos com alimentação | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:6711](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6711) | MoneySaving - Economia e desperdício | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:6762](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6762) | MoneySaving - Histórico financeiro | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:6832](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6832) | MoneySaving - Detalhes dos gastos | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:6867](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6867) | MoneySaving - Detalhes da economia | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:6905](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6905) | MoneySaving - Filtros | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:6926](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6926) | Perfil - Meu grupo | GET `/mobile/core/groups` e `/groups/{id}`; list members from group detail. | Existe via proxy |
| Doméstico | [4099:6948](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6948) | Perfil - Convidar membro | POST `/mobile/core/groups/{id}/invitations` (email + memberRole); list pending invitations with GET. | Existe via proxy |
| Doméstico | [4099:6963](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6963) | Perfil - Alterar plano | GET `/mobile/core/plans/active`, `/subscriptions/me`, `/plans/me/limits`; checkout via POST `/transactions/checkout`. | Existe via proxy |
| Doméstico | [4099:7033](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7033) | Perfil - Assinatura e planos | GET `/mobile/core/plans/active`, `/subscriptions/me`, `/plans/me/limits`; checkout via POST `/transactions/checkout`. | Existe via proxy |
| Doméstico | [4099:7068](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7068) | Perfil - Pagamento | POST `/mobile/core/transactions/checkout` aceita método e dados fictícios de sandbox; não enviar dados brutos de cartão. | Parcial — Adicionar cartão exige tokenização de um provedor de pagamento, que o Core ainda não oferece. |
| Doméstico | [4099:7092](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7092) | Perfil - Pagamento realizado | GET `/mobile/core/transactions/{transactionId}` para o estado final. | Existe via proxy |
| Doméstico | [4099:7113](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7113) | Perfil - Gerenciar plano | GET `/mobile/core/subscriptions/me`; POST `/subscriptions/me/cancel` or `/reactivate`. | Existe via proxy |
| Doméstico | [4099:7141](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7141) | Perfil - Forma de pagamento | POST `/mobile/core/transactions/checkout` aceita método e dados fictícios de sandbox; não enviar dados brutos de cartão. | Parcial — Adicionar cartão exige tokenização de um provedor de pagamento, que o Core ainda não oferece. |
| Doméstico | [4099:7161](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7161) | Perfil - Cancelar assinatura | GET `/mobile/core/subscriptions/me`; POST `/subscriptions/me/cancel` or `/reactivate`. | Existe via proxy |
| Doméstico | [4099:7180](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7180) | MoneySaving - Visão geral | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:7250](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7250) | MoneySaving - Como os valores são calculados | GET `/mobile/commercial/groups/{groupId}/money-saving/summary?from&to`; GET `/events?from&to&category&kind&page&size`; compras: POST/GET/PUT/DELETE `/food-purchases`. | Novo BFF — Conta COMMERCIAL/BUSINESS e plano com `allowMoneySaving=true`. |
| Doméstico | [4099:7270](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7270) | caminho plano | Fluxo de navegação no protótipo; sem chamada de API. | UI |
| Doméstico | [4099:7274](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7274) | Perfil | GET `/mobile/user/profile`; GET `/mobile/core/subscriptions/me` and `/plans/me/limits`. | Existe |
| Doméstico | [4099:7309](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7309) | Perfil - Ajuda e suporte | FAQ pode ser conteúdo estático; tickets: POST `/mobile/core/support/requests`, GET `/support/requests`. | Novo Core via proxy |
| Doméstico | [4099:7334](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7334) | Perfil - Adicionar cartão | Depende de tokenização por gateway de pagamento; não enviar número/CVV. | Integração externa pendente |
| Doméstico | [4099:7362](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7362) | Estoque - Categorias (Geladeira) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Doméstico | [4099:7408](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7408) | Estoque - Categorias (Freezer) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Doméstico | [4099:7448](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7448) | Estoque - Categorias (Despensa) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Doméstico | [4099:7494](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7494) | Receita - Detalhes da receita | GET `/mobile/recipes/{id}?stockId`; PUT/DELETE `/favorite`. | Existe |
| Doméstico | [4099:7532](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7532) | Configurações - Preferências de alimentos | GET/PUT `/mobile/core/profile/app-settings`; preferências `VEGETARIAN`, `VEGAN`, `AVOID_RED_MEAT`, `AVOID_SEAFOOD`; restrições `LACTOSE_FREE`, `GLUTEN_FREE`, `SUGAR_FREE`. | Novo Core via proxy |
| Doméstico | [4099:7565](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7565) | Configurações - Unidades e medidas | GET/PUT `/mobile/core/profile/app-settings`; peso (`KG`, `G`, `LB`, `OZ`), volume (`L`, `ML`, `CUP`, `SPOON`) e temperatura (`CELSIUS`, `FAHRENHEIT`). | Novo Core via proxy |
| Doméstico | [4099:7575](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7575) | Configurações - Dispositivos conectados | GET `/mobile/core/profile/sessions`; DELETE `/profile/sessions/{sessionId}` encerra a sessão imediatamente. | Novo Core via proxy |
| Doméstico | [4099:7595](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7595) | Configurações - Privacidade | GET/PUT `/mobile/core/profile/app-settings` para consentimento de coleta de uso e sugestões personalizadas. | Novo Core via proxy |
| Doméstico | [4099:7607](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7607) | Configurações - Alterar senha | PATCH `/mobile/core/profile/password` com senha atual e nova senha. | Existe |
| Doméstico | [4099:7634](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7634) | Configurações - Informações da Conta | GET/PATCH `/mobile/core/profile`. | Existe via proxy |
| Doméstico | [4099:7652](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7652) | Configurações - Verificação de e-mail | GET `/mobile/core/profile/email-verification`; POST `/request` envia código próprio; POST `/verify` confirma. Não usar `/auth/verify-reset-code`. | Novo Core via proxy |
| Doméstico | [4099:7660](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7660) | Configurações | GET/PUT `/mobile/core/profile/preferences` (avisos/tema); GET/PUT `/profile/app-settings` (preferências, unidades, privacidade); `/profile/sessions`; `/profile/email-verification`; senha e conta em `/profile/password` e `/profile`. | Implementado via proxy |
| Doméstico | [4099:7701](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7701) | Ajuda e suporte - Enviar uma solicitação | POST `/mobile/core/support/requests`; resposta contém protocolo. Acompanhar com GET `/support/requests/{id}` ou lista paginada. | Novo Core via proxy |
| Doméstico | [4099:7714](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7714) | Lista de compras - Adicionar item (Lista de compras) | POST `/mobile/core/shopping-lists/{listId}/items`; concluir lista: POST `/complete`. | Existe |
| Doméstico | [4099:7738](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7738) | Lista de compras - Adicionar item (Estoque) | POST `/mobile/core/shopping-lists/{listId}/items`; concluir lista: POST `/complete`. | Existe |
| Comercial | [2631:1051](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1051) | Perfil - Assinatura e planos | GET `/mobile/core/plans/active`, `/subscriptions/me`, `/plans/me/limits`; checkout via POST `/transactions/checkout`. | Existe via proxy |
| Comercial | [2631:619](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-619) | Receitas | GET `/mobile/recipes?page&size&q`; GET `/favorites`; GET `/suggestions?stockId&limit`. | Existe |
| Comercial | [2631:778](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-778) | Home - Chat João | GET `/mobile/core/conversations`; GET/POST `/conversations/{id}/messages`; GET/PUT/DELETE `/messages/{messageId}/reactions`; POST `/messages/{messageId}/read`; DELETE `/conversations/{id}/leave`. | Existe via proxy |
| Comercial | [2631:806](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-806) | Home - Chat Família | GET `/mobile/core/conversations`; GET/POST `/conversations/{id}/messages`; GET/PUT/DELETE `/messages/{messageId}/reactions`; POST `/messages/{messageId}/read`; DELETE `/conversations/{id}/leave`. | Existe via proxy |
| Comercial | [2631:838](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-838) | Perfil | GET `/mobile/user/profile`; GET `/mobile/core/subscriptions/me` and `/plans/me/limits`. | Existe |
| Comercial | [2631:966](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-966) | Perfil - Convidar membro | POST `/mobile/core/groups/{id}/invitations` (email + memberRole); list pending invitations with GET. | Existe via proxy |
| Comercial | [2631:982](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-982) | Perfil - Alterar plano | GET `/mobile/core/plans/active`, `/subscriptions/me`, `/plans/me/limits`; checkout via POST `/transactions/checkout`. | Existe via proxy |
| Comercial | [2631:1101](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1101) | Perfil - Pagamento | POST `/mobile/core/transactions/checkout` aceita método e dados fictícios de sandbox; não enviar dados brutos de cartão. | Parcial — Adicionar cartão exige tokenização de um provedor de pagamento, que o Core ainda não oferece. |
| Comercial | [2631:1124](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1124) | Perfil - Pagamento realizado | GET `/mobile/core/transactions/{transactionId}` para o estado final. | Existe via proxy |
| Comercial | [2631:1161](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1161) | Configurações - Preferências de alimentos | GET/PUT `/mobile/core/profile/app-settings` (contrato compartilhado com Doméstico). | Novo Core via proxy |
| Comercial | [4099:8882](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-8882) | Estoque - Detalhes do Alimento | GET `/mobile/inventory/stock-products/{id}`. | Existe |
| Comercial | [4099:8912](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-8912) | Lista de compras - Editar Peito de Frango | PATCH `/mobile/core/shopping-lists/{listId}/items/{itemId}`. | Existe |
| Comercial | [4099:8936](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-8936) | Estoque - Editar Peito de Frango | PUT `/mobile/inventory/stock-products/{id}`. | Existe |
| Comercial | [4099:8963](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-8963) | Lista de compras - Adicionar item (Lista de compras) | POST `/mobile/core/shopping-lists/{listId}/items`; concluir lista: POST `/complete`. | Existe |
| Comercial | [4099:8987](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-8987) | Lista de compras - Adicionar item (Estoque) | POST `/mobile/core/shopping-lists/{listId}/items`; concluir lista: POST `/complete`. | Existe |
| Comercial | [2631:1199](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1199) | Configurações - Unidades e medidas | GET/PUT `/mobile/core/profile/app-settings` (contrato compartilhado com Doméstico). | Novo Core via proxy |
| Comercial | [2631:1274](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1274) | Central de notificações | GET `/mobile/notifications?page&size&unreadOnly`; PATCH `/{id}/read`, PATCH `/read-all`, DELETE `/`. | Existe |
| Comercial | [2631:1323](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1323) | Central de notificações - Limpa | GET `/mobile/notifications?page&size&unreadOnly`; PATCH `/{id}/read`, PATCH `/read-all`, DELETE `/`. | Existe |
| Comercial | [2631:1327](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1327) | Home - ChatIA Ajuda e suporte | FAQ pode ser conteúdo estático; tickets: POST `/mobile/core/support/requests`, GET `/support/requests`. | Novo Core via proxy |
| Comercial | [2631:1631](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1631) | Estoque - Remover Peito de Frango | DELETE `/mobile/inventory/stock-products/{id}`; confirmar no app antes de enviar. | Existe |
| Comercial | [2631:1669](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1669) | Configurações - Dispositivos conectados | GET `/mobile/core/profile/sessions`; DELETE `/profile/sessions/{sessionId}` encerra a sessão imediatamente. | Novo Core via proxy |
| Comercial | [2631:1693](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1693) | Configurações - Privacidade | GET/PUT `/mobile/core/profile/app-settings` para consentimento de coleta de uso e sugestões personalizadas. | Novo Core via proxy |
| Comercial | [2631:1742](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1742) | Configurações - Alterar senha | PATCH `/mobile/core/profile/password` com senha atual e nova senha. | Existe |
| Comercial | [3475:12691](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3475-12691) | Configurações - Informações da Conta | GET/PATCH `/mobile/core/profile`. | Existe via proxy |
| Comercial | [2631:1768](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1768) | Alterar senha - Esqueci minha senha | POST `/mobile/core/auth/forgot-password`; POST `/mobile/core/auth/verify-reset-code`; POST `/mobile/core/auth/reset-password`. | Existe |
| Comercial | [2631:1781](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1781) | Configurações - Verificação de e-mail | GET `/mobile/core/profile/email-verification`; POST `/request` envia código próprio; POST `/verify` confirma. Não usar `/auth/verify-reset-code`. | Novo Core via proxy |
| Comercial | [2631:1792](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1792) | Perfil - Ajuda e suporte | FAQ pode ser conteúdo estático; tickets: POST `/mobile/core/support/requests`, GET `/support/requests`. | Novo Core via proxy |
| Comercial | [2631:1829](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1829) | Ajuda e suporte - Enviar uma solicitação | POST `/mobile/core/support/requests`; resposta contém protocolo. Acompanhar com GET `/support/requests/{id}` ou lista paginada. | Novo Core via proxy |
| Comercial | [2631:1868](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1868) | Perfil - Gerenciar plano | GET `/mobile/core/subscriptions/me`; POST `/subscriptions/me/cancel` or `/reactivate`. | Existe via proxy |
| Comercial | [2631:1895](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-1895) | Perfil - Forma de pagamento | POST `/mobile/core/transactions/checkout` aceita método e dados fictícios de sandbox; não enviar dados brutos de cartão. | Parcial — Adicionar cartão exige tokenização de um provedor de pagamento, que o Core ainda não oferece. |
| Comercial | [3531:2381](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3531-2381) | Perfil - Adicionar cartão | Depende de tokenização por gateway de pagamento; não enviar número/CVV. | Integração externa pendente |
| Comercial | [2631:2394](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-2394) | caminho plano | Fluxo de navegação no protótipo; sem chamada de API. | UI |
| Comercial | [2631:2398](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=2631-2398) | caminho perfil | Fluxo de navegação no protótipo; sem chamada de API. | UI |
| Comercial | [3058:1105](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3058-1105) | Login | POST `/mobile/user/login`; Google: POST `/mobile/core/auth/google`. | Email pronto; login por telefone depende de SMS/OTP |
| Comercial | [3404:1027](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3404-1027) | Criar Conta | POST `/mobile/user/register`. | Existe |
| Comercial | [3083:1332](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3083-1332) | Home | GET `/mobile/home?groupId`. | Novo BFF |
| Comercial | [3461:12348](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3461-12348) | Lista de compras | GET `/mobile/core/shopping-lists?stockId&page&size&status`; POST lista e GET suggestions. | Existe |
| Comercial | [3191:1035](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3191-1035) | Ler QR Code | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Comercial | [3191:1060](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3191-1060) | Ler QR Code - Carregando | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Comercial | [3191:1072](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3191-1072) | Ler QR Code - Itens da nota fiscal | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Comercial | [3191:1122](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3191-1122) | Ler QR Code - Confirmação | POST `/mobile/inventory/receipts/scan`; GET `/receipts/{receiptId}` enquanto processa; POST `/receipts/{receiptId}/confirm` para importar/ignorar linhas. | Existe |
| Comercial | [3405:1098](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3405-1098) | Requisitos senha | Validação local do formulário; enviar somente na operação de cadastro ou redefinição. | UI |
| Comercial | [3475:12597](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3475-12597) | Configurações | GET/PUT `/mobile/core/profile/preferences` (avisos/tema); GET/PUT `/profile/app-settings` (preferências, unidades, privacidade); `/profile/sessions`; `/profile/email-verification`; senha e conta em `/profile/password` e `/profile`. | Implementado via proxy |
| Comercial | [3580:4471](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4471) | Estoque | GET `/mobile/inventory/home?groupId` para resumo; usar o filtro `storagePlace` para a lista. | Existe |
| Comercial | [3580:4561](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4561) | Estoque - Freezer | GET `/mobile/inventory/home?groupId` para resumo; usar o filtro `storagePlace` para a lista. | Existe |
| Comercial | [3580:4651](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4651) | Estoque - Despensa | GET `/mobile/inventory/home?groupId` para resumo; usar o filtro `storagePlace` para a lista. | Existe |
| Comercial | [3580:4742](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4742) | Estoque - Categorias (Geladeira) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Comercial | [3580:4810](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4810) | Estoque - Categorias (Freezer) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Comercial | [3580:4872](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4872) | Estoque - Categorias (Despensa) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Comercial | [3580:4940](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-4940) | Estoque - Categorias (Geladeira) | GET `/mobile/inventory/products?groupId&storagePlace&category&q&page&size` ou `/mobile/inventory/stocks/{stockId}/products`. | Existe |
| Comercial | [3580:5191](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-5191) | Home - Chat IA | GET `/mobile/recipes/ai/suggestions/{stockId}`; POST `/mobile/recipes/ai/chat`. | Existe |
| Comercial | [3580:5232](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-5232) | Receita - Detalhes da receita | GET `/mobile/recipes/{id}?stockId`; PUT/DELETE `/favorite`. | Existe |
| Comercial | [3787:2820](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3787-2820) | Home - Hub de conversas | GET `/mobile/core/conversations`; GET/POST `/conversations/{id}/messages`; GET/PUT/DELETE `/messages/{messageId}/reactions`; POST `/messages/{messageId}/read`; DELETE `/conversations/{id}/leave`. | Existe via proxy |
| Comercial | [4080:6641](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4080-6641) | Perfil - Meu grupo | GET `/mobile/core/groups` e `/groups/{id}`; list members from group detail. | Existe via proxy |

## Nós que não são telas completas

| Plano | Node | Tipo e nome | Contrato |
|---|---|---|---|
| Doméstico | [4099:6925](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-6925) | vector: Arrow 10 | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7766](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7766) | text: Observações (opcional) | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7767](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7767) | rounded-rectangle: Observações | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7768](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7768) | text: Ex.: peito, coxa, marca... | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7769](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7769) | text: Unidade de medida | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7770](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7770) | rounded-rectangle: Campo • Unidade | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7771](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7771) | text: Gramas | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7772](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7772) | instance: Voltar ícone | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7773](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7773) | text: Unidade de medida | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7774](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7774) | rounded-rectangle: Campo • Unidade | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7775](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7775) | text: Gramas | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Doméstico | [4099:7776](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-7776) | instance: Voltar ícone | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9015](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9015) | text: Unidade de medida | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9016](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9016) | rounded-rectangle: Campo • Unidade | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9017](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9017) | text: Gramas | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9018](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9018) | instance: Voltar ícone | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9019](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9019) | text: Unidade de medida | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9020](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9020) | rounded-rectangle: Campo • Unidade | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9021](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9021) | text: Gramas | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [4099:9022](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=4099-9022) | instance: Voltar ícone | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |
| Comercial | [3580:5646](https://www.figma.com/design/s4sWZm7r8a6pH6X1Oecp9I/Frigus?node-id=3580-5646) | text: Voltar para o login | Fragmento de formulário/ícone/diagrama; herda o contrato do fluxo pai. |

## Endpoint composto reutilizável: Home

### `GET /mobile/home?groupId={uuid}`

Autenticado. O parâmetro `groupId` é opcional quando a conta possui um único grupo ativo. `notificationSize` opcional (padrão 5, limite recomendado 50).

Resposta agrega perfil, contexto do grupo, estoques, resumo de estoque, notificações recentes, contador não lido e sugestões de receita.

```json
{
  "user": {
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "Juliana",
    "email": "juliana@example.com",
    "accountType": "COMMERCIAL"
  },
  "groupId": "00000000-0000-4000-8000-000000000002",
  "stocks": [{ "id": 1, "name": "Loja Centro" }],
  "inventorySummary": {
    "stockCount": 2,
    "productCount": 18,
    "itemCount": 25,
    "nearExpiration": []
  },
  "notifications": [],
  "unreadNotificationCount": 0,
  "recipeSuggestions": []
}
```

## MoneySaving comercial

Reutiliza os mesmos dados para visão geral, gastos, economia/desperdício, histórico, filtros e detalhes por categoria. Todos os endpoints verificam o tipo de conta (`COMMERCIAL` ou compatibilidade legada `BUSINESS`), o entitlement do plano (`allowMoneySaving`) e o acesso do usuário ao grupo no Core. A rota genérica `/mobile/core/groups/{groupId}/money-saving/**` e `/food-purchases/**` aplica a mesma regra.

### `GET /mobile/commercial/groups/{groupId}/money-saving/summary?from=2026-10-01&to=2026-11-01`

Sem request body. `from` inclusivo e `to` exclusivo no formato ISO `YYYY-MM-DD`.

Resposta `200`:

```json
{
  "spending": { "amount": 850.5, "actions": 12 },
  "saving": { "amount": 120.0, "actions": 8 },
  "loss": { "amount": 25.0, "actions": 2 },
  "previousSpending": 910.0,
  "spendingChangePercent": -6.5,
  "hasFinancialData": true,
  "categories": [{ "category": "DAIRY", "spent": 200.0, "saved": 40.0, "lost": 5.0 }],
  "months": [{ "month": "2026-10", "spent": 850.5, "saved": 120.0, "lost": 25.0 }]
}
```

### `GET /mobile/commercial/groups/{groupId}/money-saving/events?from=2026-10-01&to=2026-11-01&page=0&size=20`

Filtros opcionais: `category=HORTIFRUTI|MEAT|DAIRY|GRAIN|BEVERAGE`, `kind=PURCHASE|CONSUMED|DISCARDED`. Resposta paginada de eventos com valores verificados, categorias, quantidade, data e motivo.

Resposta `200`:

```json
{
  "content": [{
    "id": "P:42",
    "kind": "PURCHASE",
    "date": "2026-10-10",
    "productName": "Leite",
    "category": "DAIRY",
    "categoryGroup": "DAIRY",
    "unitOfMeasure": "LITER",
    "quantity": 2,
    "amount": 12.5,
    "verifiedValue": true,
    "includedInMetric": true,
    "reasonCode": null,
    "categoryAmounts": [{ "category": "DAIRY", "amount": 12.5 }]
  }],
  "totalElements": 1,
  "number": 0,
  "size": 20,
  "totalPages": 1
}
```

### `POST /mobile/commercial/groups/{groupId}/food-purchases`

Envie o cabeçalho `Idempotency-Key` (1–160 caracteres). `source` aceita `USER_CONFIRMED` ou `RECEIPT_CAPTURED`; cada linha precisa de produto, estoque, validade, quantidade e preço positivo.

Request JSON:

```json
{
  "purchaseDate": "2026-10-10",
  "source": "USER_CONFIRMED",
  "receiptReference": "NFC-e-123",
  "lines": [{
    "stockId": 1,
    "productId": 1,
    "expireDate": "2026-11-10",
    "quantity": 2,
    "unitPrice": 6.25,
    "category": "DAIRY"
  }]
}
```

Resposta `201`:

```json
{
  "id": "00000000-0000-4000-8000-000000000030",
  "purchaseDate": "2026-10-10",
  "source": "USER_CONFIRMED",
  "receiptReference": "NFC-e-123",
  "version": 1,
  "total": 12.5,
  "lines": [{
    "id": 42,
    "stockKey": 1,
    "stockProductId": 7,
    "productName": "Leite",
    "category": "DAIRY",
    "categoryGroup": "DAIRY",
    "unitOfMeasure": "LITER",
    "expireDate": "2026-11-10",
    "quantity": 2,
    "unitPrice": 6.25,
    "total": 12.5
  }]
}
```

### `GET /mobile/commercial/groups/{groupId}/food-purchases/{purchaseId}`

Request JSON: sem body.

Resposta `200`:

```json
{
  "id": "00000000-0000-4000-8000-000000000030",
  "purchaseDate": "2026-10-10",
  "source": "USER_CONFIRMED",
  "receiptReference": "NFC-e-123",
  "version": 1,
  "total": 12.5,
  "lines": [{
    "id": 42,
    "stockKey": 1,
    "stockProductId": 7,
    "productName": "Leite",
    "category": "DAIRY",
    "categoryGroup": "DAIRY",
    "unitOfMeasure": "LITER",
    "expireDate": "2026-11-10",
    "quantity": 2,
    "unitPrice": 6.25,
    "total": 12.5
  }]
}
```

### `PUT /mobile/commercial/groups/{groupId}/food-purchases/{purchaseId}`

Correção otimista: envie a `version` atual e preserve os IDs das linhas. Produto, estoque e validade não podem mudar; quantidade e preço podem ser corrigidos.

Request JSON:

```json
{
  "purchaseDate": "2026-10-10",
  "source": "USER_CONFIRMED",
  "receiptReference": "NFC-e-123",
  "version": 1,
  "lines": [{ "id": 42, "quantity": 2, "unitPrice": 6.5, "category": "DAIRY" }]
}
```

Resposta `200`: versão incrementada e total recalculado.

```json
{
  "id": "00000000-0000-4000-8000-000000000030",
  "purchaseDate": "2026-10-10",
  "source": "USER_CONFIRMED",
  "receiptReference": "NFC-e-123",
  "version": 2,
  "total": 13.0,
  "lines": [{
    "id": 42,
    "stockKey": 1,
    "stockProductId": 7,
    "productName": "Leite",
    "category": "DAIRY",
    "categoryGroup": "DAIRY",
    "unitOfMeasure": "LITER",
    "expireDate": "2026-11-10",
    "quantity": 2,
    "unitPrice": 6.5,
    "total": 13.0
  }]
}
```

### `DELETE /mobile/commercial/groups/{groupId}/food-purchases/{purchaseId}`

Request JSON: sem body. A compra só pode ser excluída quando não houver saídas vinculadas.

Resposta: HTTP `204 No Content`, sem JSON.

## Configurações compartilhadas entre planos

As telas doméstica e comercial usam o mesmo contrato. `PUT` substitui o objeto completo. As unidades aceitas seguem as opções visíveis no Figma.

### `GET /mobile/core/profile/app-settings`

Resposta inicial padrão (também usada como request do `PUT`):

```json
{
  "foodPreferences": {
    "preferences": [],
    "restrictions": [],
    "quickRecipesEnabled": true,
    "budgetRecipesEnabled": true
  },
  "units": { "weight": "KG", "volume": "L", "temperature": "CELSIUS" },
  "privacy": {
    "usageDataCollectionAllowed": true,
    "personalizedSuggestionsAllowed": true
  }
}
```

### `PUT /mobile/core/profile/app-settings`

```json
{
  "foodPreferences": {
    "preferences": ["VEGETARIAN", "AVOID_SEAFOOD"],
    "restrictions": ["LACTOSE_FREE", "GLUTEN_FREE"],
    "quickRecipesEnabled": true,
    "budgetRecipesEnabled": false
  },
  "units": { "weight": "KG", "volume": "ML", "temperature": "CELSIUS" },
  "privacy": {
    "usageDataCollectionAllowed": false,
    "personalizedSuggestionsAllowed": true
  }
}
```

Retorna o objeto salvo com o mesmo formato (`200`). Valores permitidos: preferências `VEGETARIAN|VEGAN|AVOID_RED_MEAT|AVOID_SEAFOOD`; restrições `LACTOSE_FREE|GLUTEN_FREE|SUGAR_FREE`; peso `KG|G|LB|OZ`; volume `L|ML|CUP|SPOON`; temperatura `CELSIUS|FAHRENHEIT`.

## Dispositivos conectados

- `GET /mobile/core/profile/sessions` retorna as sessões ativas. Cada sessão inclui `id`, `deviceName`, `createdAt`, `lastActiveAt`, `current` e `location`. `location` será `null` até existir uma integração de geolocalização; a API não estima localização.
- `DELETE /mobile/core/profile/sessions/{sessionId}` encerra a sessão correspondente e revoga imediatamente os access tokens emitidos para ela. Resposta `204`.
- Login mobile passa o `User-Agent` do dispositivo para identificar família/nome. Sessões antigas são incluídas quando o refresh token é atualizado.

Exemplo de resposta:

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000010",
    "deviceName": "iPhone",
    "createdAt": "2026-10-27T10:00:00Z",
    "lastActiveAt": "2026-10-27T12:30:00Z",
    "current": true,
    "location": null
  }
]
```

## Verificação do e-mail

O Figma nomeia a tela “Verificação de e-mail”, mas o texto visual menciona redefinição de senha. Os contratos abaixo são próprios para confirmar o e-mail e não reutilizam recuperação de senha. O fluxo exige sessão autenticada.

- `GET /mobile/core/profile/email-verification` → `{"email":"juliana@example.com","verified":false}`.
- `POST /mobile/core/profile/email-verification/request` sem body envia código de seis dígitos. Resposta `204`; reenvio limitado a um por minuto.
- `POST /mobile/core/profile/email-verification/verify` com `{"code":"123456"}` retorna `{"email":"juliana@example.com","verified":true}` (`200`). Código expira em 10 minutos e tem até cinco tentativas.

## Ajuda e suporte

`POST /mobile/core/support/requests` abre um chamado autenticado e retorna protocolo. `GET /mobile/core/support/requests?page=0&size=20` lista os chamados da conta; `GET /mobile/core/support/requests/{id}` consulta um chamado do próprio usuário. Status atuais: `OPEN`, `IN_PROGRESS`, `RESOLVED`.

Request:

```json
{
  "subject": "Não consigo importar uma nota",
  "description": "A leitura do QR Code termina, mas os itens não aparecem no estoque."
}
```

Response `201`:

```json
{
  "id": "00000000-0000-4000-8000-000000000020",
  "protocol": "FRG-00000000",
  "status": "OPEN",
  "subject": "Não consigo importar uma nota",
  "description": "A leitura do QR Code termina, mas os itens não aparecem no estoque.",
  "createdAt": "2026-10-27T12:30:00Z",
  "updatedAt": "2026-10-27T12:30:00Z"
}
```

`GET /mobile/core/support/requests/{id}` retorna o mesmo objeto do chamado (`200`). A lista retorna uma página Spring:

```json
{
  "content": [{
    "id": "00000000-0000-4000-8000-000000000020",
    "protocol": "FRG-00000000",
    "status": "OPEN",
    "subject": "Não consigo importar uma nota",
    "description": "A leitura do QR Code termina, mas os itens não aparecem no estoque.",
    "createdAt": "2026-10-27T12:30:00Z",
    "updatedAt": "2026-10-27T12:30:00Z"
  }],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0,
  "numberOfElements": 1,
  "first": true,
  "last": true,
  "empty": false
}
```

## Capacidades ainda dependentes de integração

1. Adicionar/salvar cartão exige tokenização por gateway de pagamento. O checkout Core aceita dados fictícios apenas no modo simulado; o app nunca deve enviar número/CVV ao BFF.
2. A tela de login aceita telefone no Figma, mas o Core só autentica por e-mail; não existe fluxo de verificação de telefone/SMS.
3. A tela de dispositivos mostra cidade/estado, mas não há integração de geolocalização; por isso `location` é `null`.
4. O Figma não especifica política nem provedor de atendimento; os tickets persistem e recebem protocolo, mas não são encaminhados a uma central externa automaticamente.


