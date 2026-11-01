# Frigus BFF

Gateway Hono entre web/mobile e `frigus-core-api`.

## Executar localmente

1. Inicie a core-api e dependências em `frigus-core-api` com
   `docker compose up --build`.
2. Copie `.env.example` para `.env`. Ajuste `API_BASE_URL` se a core-api não
   estiver em `http://localhost:8080` e `WEB_ORIGINS` para a origem do web.
3. Execute `npm install` e `npm run dev`.
4. Inicie `frigus-react-web` e abra `http://localhost:5173`.

O BFF atende em `http://localhost:3000`; `GET /health` confirma que o processo
está ativo. Isso não substitui a checagem de saúde da core-api.

## Sessão

Login grava cookies `HttpOnly`. A opção “Manter conectado” define se o cookie de
refresh é persistente ou termina ao fechar o navegador; o BFF mantém essa escolha
ao renovar tokens. Em produção, configure `WEB_ORIGINS` com as origens exatas do
web e use HTTPS.

O login web com Google usa `POST /web/auth/google`: o BFF recebe o ID token, repassa-o à rota `/auth/google` da Core API e grava os mesmos cookies `HttpOnly` usados no login por senha. Configure o mesmo OAuth Client ID no frontend (`VITE_GOOGLE_CLIENT_ID`) e na Core API (`GOOGLE_CLIENT_ID`); o BFF não precisa armazenar o Client ID nem o ID token.

Configure `CORS_ALLOWED_ORIGINS` no Core API com a mesma lista de origens web
permitidas. O Core API recebe tokens somente por `Authorization: Bearer`; os
cookies de sessão ficam restritos ao BFF. O BFF exige um cabeçalho `Origin`
permitido nas requisições web que alteram dados.

## Contratos

O documento completo para o time mobile está em
[Contratos da API Mobile](docs/mobile-api-contracts.md): todos os endpoints
montados em `/mobile`, aliases das telas, parâmetros, JSONs de entrada/saída,
autenticação, campos opcionais e lacunas do canal.

As rotas web ficam sob `/web`. Veja `docs/frontend-screen-contract.md` e
`docs/core-api-todo.md` para os contratos já ligados e as próximas integrações.
O mapeamento das telas Mobile de estoque, receitas e notificações está em
`docs/mobile-screen-contract.md`; lacunas da core-api para essas telas estão em
`TODO.md`.

## Cadastro e planos

Após criar a conta, o frontend lista os planos ativos em `GET /web/plans`. A conta escolhe um plano compatível com seu perfil; o plano gratuito é ativado pela Core API sem etapa de pagamento. Para planos pagos, `POST /web/core/transactions/checkout` inicia a transação e `GET /web/core/transactions/:id` consulta o resultado. O frontend só libera o acesso após a API confirmar a aprovação.

O estado de escolha de plano e o identificador da transação pendente fazem parte do contrato de usuário da Core API e são repassados pelo BFF. A tela de checkout existente é demonstrativa e não processa cobrança real. A migração Flyway `V018__user_plan_selection.sql` é executada pela Core API ao iniciar com Flyway habilitado; veja também a documentação do fluxo no README do `frigus-react-web`.
