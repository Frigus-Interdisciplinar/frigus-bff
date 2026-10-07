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

## Contratos

As rotas web ficam sob `/web`. Veja `docs/frontend-screen-contract.md` e
`docs/core-api-todo.md` para os contratos já ligados e as próximas integrações.
