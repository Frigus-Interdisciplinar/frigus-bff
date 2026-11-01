# 🚀 Pull Request

## 📌 Contexto
> Integrar os contratos usados pelas telas recuperadas no Android: transferência da lista ao estoque com preço real, sincronização Firebase por conta e chat com preferências alimentares. Não substitui implantação dos serviços nem configuração do Firebase.

## 🛠️ O que foi feito?
- [x] Feature X adicionada / Bug Y corrigido
- [ ] Refatoração do componente Z
- [x] Atualização de dependências ou variáveis de ambiente

- Criação manual de lote valida grupo/estoque autorizados e encaminha `purchaseUnitPrice` positivo com até duas casas decimais. O preço não é inventado a partir do catálogo.
- O PATCH publicado da lista continua aceito pelo mobile e é convertido ao PUT exigido pelo Core.
- `POST /mobile/firebase/session` valida a identidade no Core e emite custom token com o mesmo UID. Credenciais Admin são carregadas apenas no servidor; ausência de configuração não simula sucesso. Dependência `firebase-admin` adicionada.
- O chat encaminha os nove identificadores de preferência validados e preserva uma única chamada autenticada ao Core. Contrato documenta `recipeIds` e a integração interna Core/IA.
- Commits separados para transferência ao estoque, sessão Firebase e preferências do chat.

## 🧪 Como validar?
1. Executado `node node_modules/typescript/bin/tsc`: aprovado. `npm run build` encontrou um problema do wrapper CMD no caminho Windows contendo `J&F`; o mesmo compilador foi executado diretamente, sem alterar o projeto.
2. Executado `node --import tsx --test tests/ai-chat-integration.test.ts tests/firebase-session.test.ts tests/shopping-recovery.test.ts`: 10 testes aprovados, zero falhas.
3. Pendente no ambiente integrado: autenticar, criar um lote com grupo/estoque corretos e preço confirmado; rejeitar preço inválido ou estoque de outro grupo; conferir registro financeiro único no Core.
4. Pendente: configurar Firebase, obter sessão por conta, reconectar a lista offline e conferir persistência/regras. Configuração e regras estão documentadas no repositório Android em `docs/firebase-shopping-setup.md`.
5. Pendente após implantação Core/IA compatível: perguntar pelo estoque selecionado e solicitar receita com preferências; conferir IDs persistidos. Nenhum chat ou pagamento real foi enviado pelos testes.

## 🔍 Checklist de Qualidade
- [x] **Auto-review:** Deletei códigos comentados, logs de debug e limpei imports não usados.
- [x] **Breaking Changes:** Essa alteração exige novas variáveis de ambiente (`.env`) ou quebra compatibilidade?
- [x] **Performance:** Garanti que não há queries, renderizações redundantes ou loops desnecessários.

Configuração adicional: `FIREBASE_PROJECT_ID` e credencial Admin via `FIREBASE_SERVICE_ACCOUNT_JSON` ou ADC. Não há segredo versionado. A rota é aditiva; o corpo do chat mantém preferências opcionais. O projeto deve coincidir com o Android. Os testes simulam fronteiras externas; não comprovam configuração do Render ou regras Firebase publicadas.

---
### 📸 Evidências Visuais
<details>
<summary>Clique para expandir</summary>

Sem interface visual neste repositório. Evidências automatizadas: compilação TypeScript e dez testes de contrato. Validação ponta a ponta permanece pendente.

</details>
