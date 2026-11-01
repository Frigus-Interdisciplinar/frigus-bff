## Contexto
Integrar os contratos usados pelas telas recuperadas do mobile e alinhar o acesso ao MoneySaving com o `dev` atual.

## O que foi feito
- MoneySaving exige assinatura ACTIVE, período vigente e `allowMoneySaving` do Core.
- Cadastro de lote preserva grupo/estoque autorizado e preço real informado; atualização da lista usa o método esperado pelo Core.
- Sessão Firebase vinculada à identidade do Core para sincronizar a lista de compras.
- Chat encaminha preferências alimentares e preserva os IDs de receitas retornados.
- Conflito com `dev` resolvido preservando a correção recente de assinatura.

## Como validar
- Compilar com `node node_modules/typescript/bin/tsc`.
- Executar `node --import tsx --test tests/*.test.ts`.
- No app, conferir restrição de plano, lote com preço, sincronização por conta e chat com preferências.

Validação local: compilação TypeScript e **16 testes aprovados**, sem falhas.

## Checklist
- [x] Revisão do conflito e preservação das integrações.
- [ ] Validação ponta a ponta após configuração/implantação.

Firebase exige `FIREBASE_PROJECT_ID` e credencial Admin no servidor (JSON ou ADC). Nenhum segredo versionado.
