# Frigus BFF — contratos para integração mobile

**Referência: 26/10/2026.** Inventário dos **29 endpoints efetivamente montados em `/mobile`** no código atual. Documento para compartilhamento com o time mobile: endpoint, alias da tela, autenticação, parâmetros, body, status e JSON de resposta.

Os JSONs são exemplos sintéticos baseados nas rotas, schemas e DTOs; IDs, tokens, nomes e URLs não são credenciais nem registros reais. Substitua os IDs pelos retornados nas consultas. Esta entrega documenta código; não representa uma nova execução de testes HTTP.

## 1. URL, autenticação e significado de alias

| Execução | Base do BFF |
| --- | --- |
| Compose da raiz deste workspace | `http://localhost:3001` |
| BFF isolado com PORT padrão | `http://localhost:3000` |
| Caminho do canal | `/mobile` |

Exemplo completo: `GET http://localhost:3001/mobile/inventory/home`.
No app/dispositivo, `localhost` aponta para o próprio dispositivo. A base precisa ser configurada para o host de desenvolvimento acessível ao app; no Compose atual a porta do BFF está publicada somente em `127.0.0.1`.

Headers de rotas protegidas:

```http
Authorization: Bearer <accessToken>
Accept: application/json
Content-Type: application/json
```

`Content-Type` é necessário ao enviar JSON. Somente M01/M02 dispensam autenticação. O token é obtido no JSON de M01; não encaminhe a chave interna da IA ao app.

### Alias de tela não é endpoint

Os aliases existentes são pontos de entrada da interface, como `/?alias=estoque-freezer`. **O BFF não tem rota de despacho por `?alias=` e não interpreta esse parâmetro.** O app deve mapear o alias para os endpoints e filtros documentados aqui. Acrescentar `?alias=estoque-freezer` a uma API não aplica o filtro FREEZER, não abre modal e não executa uma mutação.

Exemplo de consumo da tela:

```http
GET /mobile/inventory/products?storagePlace=FREEZER&page=0&size=30
Authorization: Bearer <accessToken>
```

Os aliases ao lado de cada contrato indicam telas consumidoras/ações relacionadas; não são parâmetros obrigatórios da requisição. O mapa completo dos 60 aliases está na seção 6. Anúncios não têm alias exclusivo cadastrado.

## 2. Índice de endpoints

| ID | Método e endpoint | Aliases relacionados | Sucesso | Auth |
| --- | --- | --- | --- | --- |
| [M01](#m01) | `POST /mobile/user/login` | `login` | 200 | Pública |
| [M02](#m02) | `POST /mobile/user/register` | `criar-conta` | 201 | Pública |
| [M03](#m03) | `GET /mobile/user/profile` | `perfil`, `caminho-perfil`, `informacoes-da-conta` | 200 | Bearer |
| [M04](#m04) | `GET /mobile/inventory/home` | `home`, `estoque` | 200 | Bearer |
| [M05](#m05) | `GET /mobile/inventory/products` | `estoque`, `estoque-freezer`, `estoque-despensa`, `categorias-geladeira`, `categorias-freezer`, `categorias-despensa` | 200 | Bearer |
| [M06](#m06) | `GET /mobile/inventory/stocks/:stockId/products` | `estoque`, `estoque-freezer`, `estoque-despensa`, `categorias-geladeira`, `categorias-freezer`, `categorias-despensa` | 200 | Bearer |
| [M07](#m07) | `GET /mobile/inventory/stock-products/:id` | `estoque-detalhe-alimento`, `estoque-editar-geladeira`, `estoque-editar-lista-compras`, `estoque-remover-alimento` | 200 | Bearer |
| [M08](#m08) | `PUT /mobile/inventory/stock-products/:id` | `estoque-editar-geladeira`, `estoque-editar-lista-compras` | 200 | Bearer |
| [M09](#m09) | `DELETE /mobile/inventory/stock-products/:id` | `estoque-remover-alimento` | 204 | Bearer |
| [M10](#m10) | `GET /mobile/inventory/stock-products/:id/movements` | `estoque-detalhe-alimento` | 200 | Bearer |
| [M11](#m11) | `POST /mobile/inventory/stock-products/:id/movements` | `estoque-detalhe-alimento` | 201 | Bearer |
| [M12](#m12) | `GET /mobile/recipes` | `receitas` | 200 | Bearer |
| [M13](#m13) | `GET /mobile/recipes/favorites` | `receitas` | 200 | Bearer |
| [M14](#m14) | `GET /mobile/recipes/suggestions` | `home`, `receitas` | 200 | Bearer |
| [M15](#m15) | `GET /mobile/recipes/:id` | `detalhe-da-receita` | 200 | Bearer |
| [M16](#m16) | `PUT /mobile/recipes/:id/favorite` | `receitas`, `detalhe-da-receita` | 204 | Bearer |
| [M17](#m17) | `DELETE /mobile/recipes/:id/favorite` | `receitas`, `detalhe-da-receita` | 204 | Bearer |
| [M18](#m18) | `GET /mobile/recipes/ai/suggestions/:stockId` | `receitas`, `chat-ia` | 200 | Bearer |
| [M19](#m19) | `POST /mobile/recipes/ai/chat` | `chat-ia`, `chat-ia-ajuda` | 200 | Bearer |
| [M20](#m20) | `GET /mobile/notifications` | `notificacoes`, `notificacoes-limpa` | 200 | Bearer |
| [M21](#m21) | `PATCH /mobile/notifications/:id/read` | `notificacoes` | 200 | Bearer |
| [M22](#m22) | `PATCH /mobile/notifications/read-all` | `notificacoes` | 204 | Bearer |
| [M23](#m23) | `DELETE /mobile/notifications` | `notificacoes-limpa` | 204 | Bearer |
| [M24](#m24) | `GET /mobile/advertisements/active` | Sem alias exclusivo | 200 | Bearer |
| [M25](#m25) | `POST /mobile/advertisements/:id/impressions` | Sem alias exclusivo | 204 | Bearer |
| [M26](#m26) | `POST /mobile/advertisements/:id/clicks` | Sem alias exclusivo | 204 | Bearer |
| [M27](#m27) | `POST /mobile/inventory/receipts/scan` | `qr-code`, `qr-code-carregando` | 201 | Bearer |
| [M28](#m28) | `GET /mobile/inventory/receipts/:receiptId` | `qr-code-carregando`, `qr-code-itens` | 200 | Bearer |
| [M29](#m29) | `POST /mobile/inventory/receipts/:receiptId/confirm` | `qr-code-confirmacao` | 200 | Bearer |

## 3. Convenções e enums

- IDs de usuário, grupo, anúncio e notificação são UUIDs. `stockId`, `productId`, IDs de lote/receita/movimento são inteiros positivos; os IDs/quantidades do Core usam Integer (32 bits).
- `stockId` identifica o estoque; `productId`, o produto do catálogo; `id` em `/stock-products/:id`, o lote. Não são intercambiáveis.
- `page` começa em zero. `size` deve ser positivo. Prefira informar ambos quando a rota delega os defaults ao Core.
- Datas civis usam `yyyy-MM-dd`; **birthDate usa `dd/MM/yyyy`**. Datas/horas usam ISO 8601; converta para o fuso da interface.
- Quantidades de estoque/movimentos são inteiros. Quantidades dos ingredientes podem ser decimais ou ausentes. Dinheiro/score são números JSON.
- Campo opcional não significa aceitar `null` em qualquer body. Omita o que não quer alterar; as exceções normalizadas estão nas tabelas de M08/M11.
- Respostas repassadas do Core podem trazer campos opcionais como `null`. Ingredient omite os nulls por anotação de serialização. Não torne esses metadados obrigatórios no parser mobile.
- `204 No Content` tem corpo vazio: não tente decodificar JSON e não espere `{}` ou `null`.
- Paginação garante `content`, `totalElements`, `totalPages`, `size`, `number`. Páginas repassadas do Spring podem conter também `pageable`, `sort`, `first`, `last`, `numberOfElements`, `empty`; aceite campos adicionais. M05 monta somente os cinco campos básicos. Os exemplos de páginas abaixo mostram os campos básicos.
- Parâmetros/query desconhecidos não criam filtros adicionais. Por exemplo: `alias`, `sort` ou `status` não são contratos de filtro onde não estão listados.

### Category

```json
["FRUIT", "VEGETABLE", "DAIRY", "GRAIN", "MEAT", "BEVERAGE", "CLEANING", "PERSONAL_HYGIENE", "FISH", "FROZEN", "SWEETS", "CANNED", "SEASONING"]
```

### StoragePlace

```json
["FRIDGE", "FREEZER", "PANTRY", "CABINET", "SHELF"]
```

### UnitOfMeasure

```json
["KILOGRAM", "GRAM", "LITER", "MILLILITER", "UNIT", "DOZEN", "PACKAGE"]
```

### ProductStatus / MovementType / NotificationType

```json
{
  "ProductStatus": ["FRESH", "NEAR_EXPIRATION", "EXPIRED"],
  "MovementType": ["IN", "OUT", "ADJUSTMENT"],
  "NotificationType": ["PRODUCT_NEAR_EXPIRATION", "GROUP_MEMBER_JOINED", "SHOPPING_LIST_PRODUCT_ADDED", "SHOPPING_LIST_REMINDER", "LOW_STOCK", "OUT_OF_STOCK", "WEEKLY_SUMMARY", "AD_CLICK_MILESTONE"]
}
```

ProductStatus pode ser null em registros legados. Um cliente deve tratar valor desconhecido sem inferir que o produto está fresco.

## 4. Contratos detalhados

<a id="m01"></a>

### M01 — Login

**`POST /mobile/user/login`**

**Aliases:** `login`.  
**Autenticação:** pública.  
**Upstream:** `POST /auth/login`.

**Campos do body**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| email | string | Sim | E-mail válido. |
| rawPassword | string | Sim | Não vazia; a política de cadastro não é reaplicada ao login. |
| rememberMe | boolean | Não | Default false no Zod. Não adiciona expiresIn à resposta nem cria uma rota de renovação mobile. |

**JSON da requisição**

```json
{
  "email": "pessoa@example.test",
  "rawPassword": "SenhaExemplo1!",
  "rememberMe": false
}
```

**JSON de resposta — `200`**

```json
{
  "accessToken": "<accessToken>",
  "refreshToken": "<refreshToken>",
  "user": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Pessoa Exemplo",
    "profilePictureUrl": null,
    "email": "pessoa@example.test",
    "accountType": "DOMESTIC",
    "birthDate": "15/05/1990"
  }
}
```

O canal mobile devolve os dois tokens no JSON; não configura os cookies HttpOnly usados pelo login web. Use accessToken no Authorization das chamadas seguintes. Não existe /mobile/user/refresh montado neste código.

<a id="m02"></a>

### M02 — Cadastro

**`POST /mobile/user/register`**

**Aliases:** `criar-conta`.  
**Autenticação:** pública.  
**Upstream:** `POST /auth/register`.

**Campos do body**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| name | string | Sim | Trim; pelo menos 1 caractere. |
| email | string | Sim | E-mail válido; duplicidade é validada no Core. |
| birthDate | string | Sim | dd/MM/yyyy. O Core valida data e idade mínima de 16 anos. |
| rawPassword | string | Sim | 8–20 caracteres, maiúscula, minúscula, número e caractere especial aceito pelo schema. |
| accountType | enum | Não | DOMESTIC, COMMERCIAL ou BUSINESS; default DOMESTIC. |

**JSON da requisição**

```json
{
  "name": "Pessoa Exemplo",
  "email": "pessoa@example.test",
  "birthDate": "15/05/1990",
  "rawPassword": "SenhaExemplo1!",
  "accountType": "DOMESTIC"
}
```

**JSON de resposta — `201`**

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "name": "Pessoa Exemplo",
  "profilePictureUrl": null,
  "email": "pessoa@example.test",
  "accountType": "DOMESTIC",
  "birthDate": "15/05/1990"
}
```

Retorna o usuário, sem tokens. Depois do cadastro, execute M01 para autenticar. A autenticação do Core usa public.users.hash_password; não se trata de Supabase Auth/auth.users.

<a id="m03"></a>

### M03 — Consultar perfil

**`GET /mobile/user/profile`**

**Aliases:** `perfil`, `caminho-perfil`, `informacoes-da-conta`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /profile`.

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "name": "Pessoa Exemplo",
  "profilePictureUrl": null,
  "email": "pessoa@example.test",
  "accountType": "DOMESTIC",
  "birthDate": "15/05/1990"
}
```

Consulta apenas. Não há PUT/PATCH/DELETE de perfil, troca de senha, upload de foto nem verificação de e-mail montados no canal mobile. birthDate e profilePictureUrl podem ser null em registros legados/contas com outra origem.

<a id="m04"></a>

### M04 — Contexto e resumo do estoque

**`GET /mobile/inventory/home`**

**Aliases:** `home`, `estoque`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /stocks/active-context + GET /stocks/my-summary + GET /stock-products (todos os estoques/páginas)`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| groupId | UUID | Não | Grupo do contexto; omitido = resolvido pelo Core. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "groupId": "22222222-2222-4222-8222-222222222222",
  "stocks": [
    {
      "id": 3,
      "groupId": "22222222-2222-4222-8222-222222222222",
      "name": "Geladeira"
    }
  ],
  "summary": {
    "groupId": "22222222-2222-4222-8222-222222222222",
    "stockCount": 1,
    "productCount": 1,
    "itemCount": 1,
    "estimatedValue": 15.0,
    "pendingShoppingItems": 0,
    "quantitiesByUnit": {
      "LITER": 2
    },
    "itemsByStoragePlace": {
      "FRIDGE": 1
    },
    "consumedThisWeek": {},
    "weekStart": "2026-10-19",
    "nearExpiration": []
  },
  "categoryCounts": {
    "DAIRY": 1
  },
  "statusCounts": {
    "fresh": 1,
    "nearExpiration": 0,
    "expired": 0
  },
  "nearExpiration": []
}
```

Use stocks[].id nas chamadas que exigem stockId. O BFF resolve o grupo, busca todos os lotes dos estoques e calcula categoryCounts/statusCounts. As contagens são de lotes/itens, não a soma de quantity. Só categorias encontradas aparecem no mapa; uma chave ausente pode ser apresentada como zero. statusCounts conta FRESH, NEAR_EXPIRATION e EXPIRED; status null/sem classificação não entra nesses três contadores. nearExpiration replica summary.nearExpiration. Não há paginação neste agregado; ele não retorna a lista completa de produtos.

<a id="m05"></a>

### M05 — Listar lotes de todos os estoques do grupo

**`GET /mobile/inventory/products`**

**Aliases:** `estoque`, `estoque-freezer`, `estoque-despensa`, `categorias-geladeira`, `categorias-freezer`, `categorias-despensa`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /stocks/active-context + GET /stock-products (todos os estoques/páginas)`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| groupId | UUID | Não | Omitido = grupo resolvido pelo Core. |
| page | inteiro >= 0 | Não | Default 0. |
| size | inteiro > 0 | Não | Default 30. |
| category | Category | Não | Enum da seção 3; vazio é ignorado. |
| storagePlace | StoragePlace | Não | Enum da seção 3; vazio é ignorado. |
| q | string | Não | Busca por nome, marca ou lote; trim e lowercase pt-BR. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": 1001,
      "productId": 101,
      "stockId": 3,
      "quantity": 2,
      "initialQuantity": 5,
      "minimalQuantity": null,
      "expireDate": "2026-11-15",
      "productStatus": "FRESH",
      "category": "DAIRY",
      "batch": null,
      "product": {
        "id": 101,
        "name": "Leite integral",
        "category": "DAIRY",
        "storagePlace": "FRIDGE",
        "unitPrice": 7.5,
        "unitOfMeasure": "LITER",
        "createdAt": "2026-10-23T12:00:00Z",
        "brand": null,
        "imageUrl": null,
        "ownerGroupId": "22222222-2222-4222-8222-222222222222"
      }
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 30,
  "number": 0
}
```

O filtro é aplicado no Core, por estoque, antes do agregado. O BFF concatena as páginas de cada estoque e pagina o resultado combinado. Este envelope contém exatamente os cinco campos exemplificados. Não há parâmetro sort público nessa rota, nem garantia de ordenação global por validade entre estoques.

<a id="m06"></a>

### M06 — Listar lotes de um estoque

**`GET /mobile/inventory/stocks/:stockId/products`**

**Aliases:** `estoque`, `estoque-freezer`, `estoque-despensa`, `categorias-geladeira`, `categorias-freezer`, `categorias-despensa`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /stock-products?stockId=...`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| stockId | inteiro > 0 | Sim | ID de stocks[].id retornado por M04. |

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| page | inteiro >= 0 | Não | Default 0. |
| size | inteiro > 0 | Não | Default 30. |
| category | Category | Não | Enum da seção 3; vazio é ignorado. |
| storagePlace | StoragePlace | Não | Enum da seção 3; vazio é ignorado. |
| q | string | Não | Busca por nome, marca ou lote; trim e lowercase pt-BR. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": 1001,
      "productId": 101,
      "stockId": 3,
      "quantity": 2,
      "initialQuantity": 5,
      "minimalQuantity": null,
      "expireDate": "2026-11-15",
      "productStatus": "FRESH",
      "category": "DAIRY",
      "batch": null,
      "product": {
        "id": 101,
        "name": "Leite integral",
        "category": "DAIRY",
        "storagePlace": "FRIDGE",
        "unitPrice": 7.5,
        "unitOfMeasure": "LITER",
        "createdAt": "2026-10-23T12:00:00Z",
        "brand": null,
        "imageUrl": null,
        "ownerGroupId": "22222222-2222-4222-8222-222222222222"
      }
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 30,
  "number": 0
}
```

Repassa a página de um único estoque. Não aceita groupId para trocar o estoque; a autorização usa o stockId da URL. Escolher storagePlace=FRIDGE filtra o local do produto, não o nome do estoque.

<a id="m07"></a>

### M07 — Detalhar lote

**`GET /mobile/inventory/stock-products/:id`**

**Aliases:** `estoque-detalhe-alimento`, `estoque-editar-geladeira`, `estoque-editar-lista-compras`, `estoque-remover-alimento`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /stock-products/{id}`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID do lote (StockProduct), não productId nem stockId. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "id": 1001,
  "productId": 101,
  "stockId": 3,
  "quantity": 2,
  "initialQuantity": 5,
  "minimalQuantity": null,
  "expireDate": "2026-11-15",
  "productStatus": "FRESH",
  "category": "DAIRY",
  "batch": null,
  "product": {
    "id": 101,
    "name": "Leite integral",
    "category": "DAIRY",
    "storagePlace": "FRIDGE",
    "unitPrice": 7.5,
    "unitOfMeasure": "LITER",
    "createdAt": "2026-10-23T12:00:00Z",
    "brand": null,
    "imageUrl": null,
    "ownerGroupId": "22222222-2222-4222-8222-222222222222"
  }
}
```

product é o produto do catálogo aninhado no lote. Use quantity como saldo atual e initialQuantity como quantidade original. Nome, marca, preço, unidade, imagem e local estão em product; batch, validade e mínimo pertencem ao lote.

<a id="m08"></a>

### M08 — Editar lote/alimento

**`PUT /mobile/inventory/stock-products/:id`**

**Aliases:** `estoque-editar-geladeira`, `estoque-editar-lista-compras`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `PUT /stock-products/{id}`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID do lote. |

**Campos do body**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| name | string | Não | Trim, 1–255 caracteres. |
| category | Category | Não | Enum da seção 3. |
| storagePlace | StoragePlace | Não | Enum da seção 3. |
| quantity | inteiro >= 0 | Não | Saldo final absoluto; zero é permitido. |
| initialQuantity | inteiro >= 0 | Não | Quantidade original do lote. |
| minimalQuantity | inteiro >= 0 | Não | Mínimo. null/vazio é normalizado para ausência pelo BFF; não limpa o mínimo existente. |
| expireDate | string | Não | Data válida yyyy-MM-dd. |
| batch | string | Não | Até 120 caracteres; string vazia é aceita pelo schema. |

**JSON da requisição**

```json
{
  "name": "Leite integral",
  "category": "DAIRY",
  "storagePlace": "FRIDGE",
  "quantity": 4,
  "initialQuantity": 5,
  "minimalQuantity": 1,
  "expireDate": "2026-11-15",
  "batch": "L-2026-10"
}
```

**JSON de resposta — `200`**

```json
{
  "id": 1001,
  "productId": 101,
  "stockId": 3,
  "quantity": 4,
  "initialQuantity": 5,
  "minimalQuantity": 1,
  "expireDate": "2026-11-15",
  "productStatus": "FRESH",
  "category": "DAIRY",
  "batch": "L-2026-10",
  "product": {
    "id": 101,
    "name": "Leite integral",
    "category": "DAIRY",
    "storagePlace": "FRIDGE",
    "unitPrice": 7.5,
    "unitOfMeasure": "LITER",
    "createdAt": "2026-10-23T12:00:00Z",
    "brand": null,
    "imageUrl": null,
    "ownerGroupId": "22222222-2222-4222-8222-222222222222"
  }
}
```

É uma atualização parcial apesar do verbo PUT: envie ao menos um campo reconhecido e efetivo; {} é inválido. Omitir preserva o valor existente. Não envie null indiscriminadamente: os demais campos não o aceitam. Alteração de quantity gera ADJUSTMENT na mesma transação. Não é rota para editar unitPrice, brand, imageUrl, unitOfMeasure, productId ou stockId. Exige permissão de escrita no grupo.

<a id="m09"></a>

### M09 — Remover lote

**`DELETE /mobile/inventory/stock-products/:id`**

**Aliases:** `estoque-remover-alimento`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `DELETE /stock-products/{id}`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID do lote. |

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Sem corpo de requisição/resposta. O Core faz exclusão lógica do lote (deletedAt); não remove o produto do catálogo. Não há rota mobile de restauração. Exige permissão de escrita.

<a id="m10"></a>

### M10 — Histórico do lote

**`GET /mobile/inventory/stock-products/:id/movements`**

**Aliases:** `estoque-detalhe-alimento`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /stock-products/{id}/movements`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID do lote. |

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| page | inteiro >= 0 | Não | Omitido = padrão do Core. |
| size | inteiro > 0 | Não | Omitido = padrão do Core. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": 2001,
      "stockProductId": 1001,
      "userId": "11111111-1111-4111-8111-111111111111",
      "movementType": "OUT",
      "quantity": 1,
      "balanceAfter": 2,
      "date": "2026-10-23T12:00:00Z",
      "observation": "Uso no café",
      "purpose": "CONSUMPTION"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

O BFF não define defaults nesta rota. O exemplo usa page=0 e size=20 explicitamente. O serviço do Core lista movimentos por date decrescente. purpose é informativo (por exemplo INVENTORY, CONSUMPTION ou DISCARD); não é enviado no body de criação. date, observation e balanceAfter podem estar ausentes/null em dados legados.

<a id="m11"></a>

### M11 — Registrar movimentação

**`POST /mobile/inventory/stock-products/:id/movements`**

**Aliases:** `estoque-detalhe-alimento`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `POST /stock-products/{id}/movements`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID do lote. |

**Campos do body**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| movementType | enum | Sim | IN, OUT ou ADJUSTMENT. |
| quantity | inteiro >= 0 | Sim | IN/OUT exigem > 0. ADJUSTMENT admite zero. |
| observation | string | Não | Até 2000 caracteres; null/vazio é omitido. |

**JSON da requisição**

```json
{
  "movementType": "OUT",
  "quantity": 1,
  "observation": "Uso no café"
}
```

**JSON de resposta — `201`**

```json
{
  "id": 2001,
  "stockProductId": 1001,
  "userId": "11111111-1111-4111-8111-111111111111",
  "movementType": "OUT",
  "quantity": 1,
  "balanceAfter": 2,
  "date": "2026-10-23T12:00:00Z",
  "observation": "Uso no café",
  "purpose": "CONSUMPTION"
}
```

IN soma; OUT subtrai; ADJUSTMENT define o saldo final absoluto. OUT maior que o saldo retorna 400. O Core atribui usuário, data, saldo e purpose. Não há garantia de idempotência nesta rota: repetir a chamada pode repetir a movimentação. Exige permissão de escrita.

<a id="m12"></a>

### M12 — Catálogo de receitas

**`GET /mobile/recipes`**

**Aliases:** `receitas`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /recipes (q é repassado como name)`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| q | string | Não | Busca por nome; trim. |
| page | inteiro >= 0 | Não | Default 0. |
| size | inteiro > 0 | Não | Default 20. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": 501,
      "name": "Bebida com leite",
      "description": null,
      "instructions": "Aqueça o leite e sirva.",
      "domesticOnly": true,
      "active": true,
      "createdAt": "2026-10-23T12:00:00Z",
      "favorite": false,
      "ingredients": [
        {
          "id": 601,
          "recipeId": 501,
          "recipeName": "Bebida com leite",
          "productId": 101,
          "productName": "Leite integral",
          "productCategory": "DAIRY",
          "productUnitOfMeasure": "LITER",
          "quantity": 1,
          "unit": "L",
          "required": true,
          "createdAt": "2026-10-23T12:00:00Z",
          "updatedAt": "2026-10-23T12:00:00Z"
        }
      ]
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

Retorna receitas ativas e favorite relativo ao usuário. O DTO não garante imagem, porções ou tempo de preparo: esses campos não existem neste contrato. description/instructions podem ser null; ingredientes são uma lista.

<a id="m13"></a>

### M13 — Receitas favoritas

**`GET /mobile/recipes/favorites`**

**Aliases:** `receitas`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /recipes/favorites`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| page | inteiro >= 0 | Não | Default 0. |
| size | inteiro > 0 | Não | Default 20. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": 501,
      "name": "Bebida com leite",
      "description": null,
      "instructions": "Aqueça o leite e sirva.",
      "domesticOnly": true,
      "active": true,
      "createdAt": "2026-10-23T12:00:00Z",
      "favorite": true,
      "ingredients": [
        {
          "id": 601,
          "recipeId": 501,
          "recipeName": "Bebida com leite",
          "productId": 101,
          "productName": "Leite integral",
          "productCategory": "DAIRY",
          "productUnitOfMeasure": "LITER",
          "quantity": 1,
          "unit": "L",
          "required": true,
          "createdAt": "2026-10-23T12:00:00Z",
          "updatedAt": "2026-10-23T12:00:00Z"
        }
      ]
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

Não existe alias exclusivo para a aba Favoritas; é um estado da tela receitas. Esta rota lista favoritos existentes; a permissão de salvar um novo favorito é validada em M16.

<a id="m14"></a>

### M14 — Sugestões calculadas pelo estoque

**`GET /mobile/recipes/suggestions`**

**Aliases:** `home`, `receitas`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /recipes/suggestions`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| stockId | inteiro > 0 | Não | Omitido = inventário do grupo resolvido pelo Core. |
| limit | inteiro > 0 | Não | Default 10 no BFF; Core limita a 1–50. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
[
  {
    "recipe": {
      "id": 501,
      "name": "Bebida com leite",
      "description": null,
      "instructions": "Aqueça o leite e sirva.",
      "domesticOnly": true,
      "active": true,
      "createdAt": "2026-10-23T12:00:00Z",
      "favorite": false,
      "ingredients": [
        {
          "id": 601,
          "recipeId": 501,
          "recipeName": "Bebida com leite",
          "productId": 101,
          "productName": "Leite integral",
          "productCategory": "DAIRY",
          "productUnitOfMeasure": "LITER",
          "quantity": 1,
          "unit": "L",
          "required": true,
          "createdAt": "2026-10-23T12:00:00Z",
          "updatedAt": "2026-10-23T12:00:00Z"
        }
      ]
    },
    "matchedIngredients": 1,
    "missingIngredients": 0,
    "score": 1.0,
    "availability": [
      {
        "productId": 101,
        "productName": "Leite integral",
        "requiredQuantity": 1,
        "availableQuantity": 2,
        "unit": "L",
        "required": true,
        "available": true
      }
    ]
  }
]
```

Array sem paginação. Esta chamada calcula disponibilidade/score das receitas do catálogo; não chama o chat de IA. score é a fração dos ingredientes obrigatórios disponíveis (0–1). availability usa available, não inStock. Estoques sem saldo e itens vencidos não são considerados disponíveis pelo cálculo atual.

<a id="m15"></a>

### M15 — Detalhe e disponibilidade de receita

**`GET /mobile/recipes/:id`**

**Aliases:** `detalhe-da-receita`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /recipes/{id} + opcional GET /recipes/{id}/availability`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID real de uma receita de M12/M13/M14 ou M18/M19. |

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| stockId | inteiro > 0 | Não | Inclui availability se informado. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "id": 501,
  "name": "Bebida com leite",
  "description": null,
  "instructions": "Aqueça o leite e sirva.",
  "domesticOnly": true,
  "active": true,
  "createdAt": "2026-10-23T12:00:00Z",
  "favorite": false,
  "ingredients": [
    {
      "id": 601,
      "recipeId": 501,
      "recipeName": "Bebida com leite",
      "productId": 101,
      "productName": "Leite integral",
      "productCategory": "DAIRY",
      "productUnitOfMeasure": "LITER",
      "quantity": 1,
      "unit": "L",
      "required": true,
      "createdAt": "2026-10-23T12:00:00Z",
      "updatedAt": "2026-10-23T12:00:00Z"
    }
  ],
  "availability": [
    {
      "productId": 101,
      "productName": "Leite integral",
      "requiredQuantity": 1,
      "availableQuantity": 2,
      "unit": "L",
      "required": true,
      "available": true
    }
  ]
}
```

O JSON exemplifica stockId=3. Sem stockId, a propriedade availability não é acrescentada pelo BFF. quantity/unit de Ingredient são metadados opcionais; não substitua ausência por valores inventados. Ingredient usa @JsonInclude NON_NULL, portanto campos null podem simplesmente não aparecer.

<a id="m16"></a>

### M16 — Salvar favorita

**`PUT /mobile/recipes/:id/favorite`**

**Aliases:** `receitas`, `detalhe-da-receita`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `PUT /recipes/{id}/favorite`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID da receita. |

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Sem body. O Core exige plano que permita receitas salvas; caso contrário retorna 403. Repetir não duplica o favorito.

<a id="m17"></a>

### M17 — Remover favorita

**`DELETE /mobile/recipes/:id/favorite`**

**Aliases:** `receitas`, `detalhe-da-receita`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `DELETE /recipes/{id}/favorite`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | inteiro > 0 | Sim | ID da receita. |

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Sem body; remove a associação do usuário com a receita.

<a id="m18"></a>

### M18 — Sugestões de IA já persistidas

**`GET /mobile/recipes/ai/suggestions/:stockId`**

**Aliases:** `receitas`, `chat-ia`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /ai/recipes/suggestions/stock/{stockId}`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| stockId | inteiro > 0 | Sim | ID do estoque acessível ao usuário. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
[
  {
    "sessionId": null,
    "chatMessage": null,
    "recipeId": 501,
    "recipeName": "Bebida com leite",
    "recipeDescription": null,
    "recipeInstructions": "Aqueça o leite e sirva.",
    "ingredients": [
      {
        "id": 601,
        "recipeId": 501,
        "recipeName": "Bebida com leite",
        "productId": 101,
        "productName": "Leite integral",
        "productCategory": "DAIRY",
        "productUnitOfMeasure": "LITER",
        "quantity": 1,
        "unit": "L",
        "required": true,
        "createdAt": "2026-10-23T12:00:00Z",
        "updatedAt": "2026-10-23T12:00:00Z",
        "inStock": true,
        "expireDate": "2026-11-15"
      }
    ],
    "suggestionId": 701,
    "matchedIngredients": 1,
    "missingIngredients": 0,
    "score": 1.0,
    "nearestExpireDate": "2026-11-15"
  }
]
```

Retorna array de sugestões persistidas, em ordem de score decrescente no repositório atual. Não inicia uma nova geração e não devolve histórico de mensagens do chat. sessionId/chatMessage normalmente ficam null aqui; são campos do mesmo DTO usado em M19.

<a id="m19"></a>

### M19 — Enviar mensagem ao Chat IA

**`POST /mobile/recipes/ai/chat`**

**Aliases:** `chat-ia`, `chat-ia-ajuda`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `POST /ai/recipes/chat → frigus-ai /v1/chats e /v1/chats/{chatId}/messages`.

**Campos do body**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| message | string | Sim | Trim, 1–4000 caracteres. |
| stockId | inteiro > 0 | Sim | Estoque acessível ao usuário; envie número JSON. |
| sessionId | string | Não | Não vazia após trim. Omitir no primeiro envio; reutilizar o sessionId recebido para continuar. |

**JSON da requisição**

```json
{
  "message": "O que posso preparar com o que tenho no estoque?",
  "stockId": 3
}
```

**JSON de resposta — `200`**

```json
{
  "sessionId": "55555555-5555-4555-8555-555555555555",
  "chatMessage": "Você pode preparar uma bebida usando o leite do estoque.",
  "recipeId": 501,
  "recipeName": "Bebida com leite",
  "recipeDescription": null,
  "recipeInstructions": "Aqueça o leite e sirva.",
  "ingredients": [
    {
      "id": 601,
      "recipeId": 501,
      "recipeName": "Bebida com leite",
      "productId": 101,
      "productName": "Leite integral",
      "productCategory": "DAIRY",
      "productUnitOfMeasure": "LITER",
      "quantity": 1,
      "unit": "L",
      "required": true,
      "createdAt": "2026-10-23T12:00:00Z",
      "updatedAt": "2026-10-23T12:00:00Z",
      "inStock": true,
      "expireDate": "2026-11-15"
    }
  ],
  "suggestionId": 701,
  "matchedIngredients": 1,
  "missingIngredients": 0,
  "score": 1.0,
  "nearestExpireDate": "2026-11-15"
}
```

Resposta JSON completa, sem SSE/streaming. O BFF usa timeout de 120 segundos nessa chamada. No envio seguinte, acrescente sessionId ao mesmo body. O cliente mobile não envia X-API-Key: essa credencial é interna da Core API. Campos de receita/sugestão podem ser null/ausentes; exiba chatMessage como resposta conversacional. Limite atual: a Core pode associar/criar receita genérica mesmo em respostas apenas conversacionais. A chave local da IA está vinculada à conta de demonstração; contexto/credencial por usuário precisa ser resolvido para outros usuários. Não há histórico/retomada de conversas de IA exposto no canal mobile.

<a id="m20"></a>

### M20 — Feed e contador não lido

**`GET /mobile/notifications`**

**Aliases:** `notificacoes`, `notificacoes-limpa`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /notifications ou /notifications/unread + GET /notifications/unread-count`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| page | inteiro >= 0 | Não | Default 0. |
| size | inteiro > 0 | Não | Default 30. |
| unreadOnly | string | Não | Somente o valor literal true ativa o filtro; omitido/outros valores = false. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": "33333333-3333-4333-8333-333333333333",
      "groupId": "22222222-2222-4222-8222-222222222222",
      "type": "SHOPPING_LIST_REMINDER",
      "title": "Revise sua lista",
      "body": "Confira os itens da sua lista de compras.",
      "referenceId": "66666666-6666-4666-8666-666666666666",
      "readAt": null,
      "createdAt": "2026-10-23T12:00:00Z"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 30,
  "number": 0,
  "unreadCount": 1
}
```

unreadCount é o total não lido do usuário, não o número de itens da página. O BFF obtém página e contador em chamadas paralelas: não é um snapshot transacional único. readAt=null indica não lida. O app agrupa por data usando createdAt; não há grupos Hoje/Ontem no payload. Após limpeza, content pode ser [] e os totais/contador ficam zero.

<a id="m21"></a>

### M21 — Marcar uma notificação como lida

**`PATCH /mobile/notifications/:id/read`**

**Aliases:** `notificacoes`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `PATCH /notifications/{id}/read`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | UUID | Sim | ID da notificação do usuário. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "groupId": "22222222-2222-4222-8222-222222222222",
  "type": "SHOPPING_LIST_REMINDER",
  "title": "Revise sua lista",
  "body": "Confira os itens da sua lista de compras.",
  "referenceId": "66666666-6666-4666-8666-666666666666",
  "readAt": "2026-10-23T12:00:00Z",
  "createdAt": "2026-10-23T12:00:00Z"
}
```

Sem body; retorna a notificação com readAt preenchido. Diferente das ações em lote, esta resposta tem JSON.

<a id="m22"></a>

### M22 — Marcar todas como lidas

**`PATCH /mobile/notifications/read-all`**

**Aliases:** `notificacoes`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `PATCH /notifications/read-all`.

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Sem body. Marca como lidas; não remove o feed. Reconsulte M20 para atualizar conteúdo/contador.

<a id="m23"></a>

### M23 — Limpar o feed

**`DELETE /mobile/notifications`**

**Aliases:** `notificacoes-limpa`.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `DELETE /notifications`.

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Sem body. Oculta logicamente as notificações atuais do usuário; notificações futuras continuam podendo surgir. Abrir o alias notificacoes-limpa não executa esta ação automaticamente. Reconsulte M20 após a ação explícita.

<a id="m24"></a>

### M24 — Listar anúncios ativos

**`GET /mobile/advertisements/active`**

**Aliases:** sem alias exclusivo; componente de anúncios.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `GET /advertisements/active`.

**Query params** (na URL; não enviar como body JSON)

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| page | inteiro >= 0 | Não | Omitido = padrão do Core. |
| size | inteiro > 0 | Não | Omitido = padrão do Core. |

**Body da requisição:** ausente.

**JSON de resposta — `200`**

```json
{
  "content": [
    {
      "id": "44444444-4444-4444-8444-444444444444",
      "advertiserId": "77777777-7777-4777-8777-777777777777",
      "advertiserName": "Marca Exemplo",
      "name": "Campanha de leite",
      "productName": "Leite integral",
      "category": "Laticínios",
      "description": "Conheça o produto.",
      "imageUrl": "https://example.com/leite.jpg",
      "destinationUrl": null,
      "price": null,
      "startDate": null,
      "endDate": null,
      "status": "ACTIVE",
      "impressions": 0,
      "clicks": 0,
      "createdAt": "2026-10-23T12:00:00Z",
      "updatedAt": "2026-10-23T12:00:00Z"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

Componente de anúncios; nenhum alias exclusivo cadastrado. O exemplo usa page=0 e size=20 explicitamente. price/destinationUrl/startDate/endDate podem ser null. Não use price ausente como preço zero. Acesso autenticado no BFF, mesmo se o upstream permitir outro acesso.

<a id="m25"></a>

### M25 — Registrar impressão

**`POST /mobile/advertisements/:id/impressions`**

**Aliases:** sem alias exclusivo; componente de anúncios.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `POST /advertisements/{id}/impressions`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | UUID | Sim | ID do anúncio de M24. |

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Componente de anúncios, sem alias exclusivo. Sem body; evento enviado quando o anúncio é exibido. A rota não oferece chave de deduplicação/idempotência; não repita automaticamente sem tratar duplicidade no cliente.

<a id="m26"></a>

### M26 — Registrar clique

**`POST /mobile/advertisements/:id/clicks`**

**Aliases:** sem alias exclusivo; componente de anúncios.  
**Autenticação:** `Authorization: Bearer <accessToken>`.  
**Upstream:** `POST /advertisements/{id}/clicks`.

**Path params**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| id | UUID | Sim | ID do anúncio de M24. |

**Body da requisição:** ausente.

**Resposta: `204 No Content`, sem JSON.**

Componente de anúncios, sem alias exclusivo. Sem body; registra o evento. Não devolve redirecionamento: o app usa destinationUrl de M24 quando existir. A rota não oferece chave de deduplicação/idempotência.

## 5. Erros e limites de integração

O middleware normaliza erros de validação do BFF e erros do Core no envelope abaixo. Campos como `fields`/`displayMessage` podem não aparecer em todo erro. Não use a mensagem técnica como código de regra; verifique HTTP status, `code` e `fields[].fieldName`.

```json
{
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "Erro de validação dos campos da requisição",
  "displayMessage": "Dados inválidos enviados. Verifique os campos e tente novamente.",
  "fields": [
    {
      "fieldName": "quantity",
      "errorMessage": "Valor inválido para quantidade",
      "displayMessage": "Valor inválido para quantidade"
    }
  ],
  "timestamp": "2026-10-23T12:00:00Z"
}
```

| HTTP | Tratamento no app |
| --- | --- |
| 400 | Payload fora do schema, query/campo inválido, saldo insuficiente ou regra de negócio. Exibir displayMessage e campos disponíveis. |
| 401 | Token ausente, inválido ou expirado. Não existe renovação montada em /mobile; este fluxo ainda precisa de contrato mobile. |
| 403 | Sem permissão no grupo/estoque ou plano não permite a ação, por exemplo salvar favorita. |
| 404 | Recurso inexistente/inacessível conforme validação upstream. URL desconhecida do Hono também pode responder texto simples 404; não presuma envelope JSON fora das rotas existentes. |
| 409 | Conflito, como cadastro duplicado, conforme validação do Core. |
| 422 | Validação upstream que retornar esse status. |
| 429 | Se emitido pelo upstream, tratar como limite; o BFF não oferece headers/contrato próprio de rate limit mobile. |
| 500 | Falha interna. |
| 502 | Falha de comunicação com o Core. |
| 503 | Serviço indisponível, incluindo falha da IA normalizada pela Core. |
| 504 | Timeout de comunicação. Não repita mutações automaticamente sem avaliar duplicidade. |

Um body com sintaxe JSON malformada pode cair no tratamento genérico 500 de `c.req.json()` no código atual; o 400 de validação acima pressupõe um JSON que pôde ser decodificado.

O timeout geral do BFF depende de `API_TIMEOUT_MS` (default de código: 10 segundos; Compose local: 30 segundos). M19 usa override de 120 segundos. A chamada mobile deve permitir o tempo do fluxo de IA. Não foi implementada garantia de idempotência/deduplicação nas mutações deste canal; apenas aceitar o header `Idempotency-Key` no CORS não significa que ele seja aplicado.

### M27 — Ler QR e revisar nota fiscal

`POST /mobile/inventory/receipts/scan` recebe `{ "stockId": 12, "qrPayload": "<conteúdo do QR Code>" }` e responde `201` com `receiptId`, `status`, `invoice`, `items` e `warnings`. A chamada pode levar até 120 segundos. Envie o conteúdo do QR; upload de imagem/PDF não é suportado por este contrato.

### M28 — Consultar leitura da nota

`GET /mobile/inventory/receipts/:receiptId` recebe o UUID devolvido por M27 e retorna o mesmo contrato de leitura com estado `REVIEW_REQUIRED`, `IMPORTED` ou `FAILED`.

### M29 — Confirmar itens da nota

`POST /mobile/inventory/receipts/:receiptId/confirm` aceita `items`, cada um com `lineId` e `action`. `IMPORT` requer `productId`, `quantity` e `expireDate`; `IGNORE` descarta a linha. Responde `200` com `receiptId`, estado `IMPORTED`, `importedItems` e `ignoredLineIds`.
## 6. Mapa completo de aliases e cobertura mobile

Esta tabela reúne os 60 aliases cadastrados na interface atual. **Ter alias/página no Web não significa ter endpoint no canal `/mobile`.** IDs Mxx referem-se às rotas da seção 4; os filtros citados devem ser enviados pelo app.

| Alias | Tela | Node de referência | Contratos/filtros | Cobertura |
| --- | --- | --- | --- | --- |
| `estoque` | Estoque | `3762:2139` | M04, M05, M06 | Disponível |
| `receitas` | Receitas | `3762:2229` | M12, M13, M14, M16, M17, M18 | Disponível; favoritos dependem do plano |
| `lista-de-compras` | Lista de compras | `3762:2271` | — | Sem contrato de listas de compra em /mobile |
| `chat-ia` | Home - Chat IA | `3762:2326` | M19; M18 para sugestões persistidas | Disponível sem streaming/histórico |
| `chat-joao` | Home - Chat João | `3762:2356` | — | Sem contratos de conversas/mensagens humanas em /mobile |
| `chat-familia` | Home - Chat Família | `3762:2384` | — | Sem contratos de conversas/mensagens humanas em /mobile |
| `notificacoes` | Central de notificações | `3762:2416` | M20, M21, M22 | Disponível |
| `notificacoes-limpa` | Central de notificações - Limpa | `3762:2465` | M20, M23 | Limpeza só por ação explícita M23 |
| `chat-ia-ajuda` | Chat IA - Ajuda e suporte | `3762:2469` | M19 | Mesmo chat; sem API própria de suporte |
| `estoque-detalhe-alimento` | Estoque - Detalhes do Alimento | `3762:2507` | M07, M10, M11 | Disponível; selecionar ID real |
| `estoque-editar-geladeira` | Estoque - Editar (Geladeira) | `3762:2535` | M07, M08 | Disponível; selecionar lote da geladeira |
| `estoque-editar-lista-compras` | Estoque - Editar (Lista de compras) | `4050:4271` | M07, M08 | Edição de lote disponível; fluxo de compras sem contrato mobile |
| `estoque-remover-alimento` | Estoque - Remover Peito de Frango | `3762:2561` | M07, M09 | Disponível; confirmação é estado de UI |
| `estoque-freezer` | Estoque - Freezer | `3762:2576` | M05 ou M06; storagePlace=FREEZER | Disponível |
| `estoque-despensa` | Estoque - Despensa | `3762:2666` | M05 ou M06; storagePlace=PANTRY | Disponível |
| `esqueci-minha-senha` | Alterar senha - Esqueci minha senha | `3762:2757` | — | Sem recuperação de senha em /mobile |
| `hub-conversas` | Home - Hub de conversas | `3762:2770` | — | Sem listagem/criação de conversas em /mobile |
| `caminho-perfil` | caminho perfil | `3762:2792` | M03 | Consulta de perfil |
| `login` | Login | `3762:2798` | M01 | Disponível |
| `criar-conta` | Criar Conta | `3762:2827` | M02; M01 após cadastrar | Disponível |
| `home` | Home | `3762:2859` | M04; M14 opcional | Disponível para dados de estoque/receitas; anúncios M24–M26 sem alias exclusivo |
| `qr-code` | Ler QR Code | `3762:2932` | M27 | Leitura por conteúdo do QR; sem upload de imagem/PDF |
| `qr-code-carregando` | Ler QR Code - Carregando | `3762:2938` | M27, M28 | Consultar estado pelo receiptId |
| `qr-code-itens` | Ler QR Code - Itens da nota fiscal | `3762:2947` | M28 | Revisar itens retornados |
| `qr-code-confirmacao` | Ler QR Code - Confirmação | `3762:2989` | M29 | Confirmar importação ou ignorar linhas |
| `gastos-alimentacao` | MoneySaving - Gastos com alimentação | `3762:3011` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `economia-desperdicio` | MoneySaving - Economia e desperdício | `3762:3068` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `historico-financeiro` | MoneySaving - Histórico financeiro | `3762:3119` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `detalhes-gastos` | MoneySaving - Detalhes dos gastos | `3762:3195` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `detalhes-economia` | MoneySaving - Detalhes da economia | `3762:3236` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `filtros-financeiros` | MoneySaving - Filtros | `3762:3277` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `familia` | Perfil - Minha família | `3762:3307` | — | Sem contratos de grupos/membros em /mobile |
| `convidar-membro` | Perfil - Convidar membro | `3762:3329` | — | Sem convites em /mobile |
| `alterar-plano` | Perfil - Alterar plano | `3762:3345` | — | Sem catálogo/contratação de planos em /mobile |
| `assinatura-planos` | Perfil - Assinatura e planos | `3762:3414` | — | Sem consulta de assinatura em /mobile |
| `pagamento` | Perfil - Pagamento | `3762:3456` | — | Sem checkout/transações em /mobile |
| `pagamento-realizado` | Perfil - Pagamento realizado | `3762:3479` | — | Sem consulta do processamento de transação em /mobile |
| `gerenciar-plano` | Perfil - Gerenciar plano | `3762:3512` | — | Sem gestão de assinatura em /mobile |
| `forma-de-pagamento` | Perfil - Forma de pagamento | `3762:3539` | — | Sem gestão de forma de pagamento em /mobile |
| `cancelar-assinatura` | Perfil - Cancelar assinatura | `3762:3557` | — | Sem cancelamento de assinatura em /mobile |
| `visao-geral-financeira` | MoneySaving - Visão geral | `3762:3574` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `como-valores-calculados` | MoneySaving - Como os valores são calculados | `3762:3640` | — | Sem contrato HTTP de MoneySaving em /mobile; ferramentas conversacionais da IA não substituem esse contrato |
| `caminho-plano` | caminho plano | `3762:3660` | — | Sem contratos de planos em /mobile |
| `perfil` | Perfil | `3762:3664` | M03 | Somente consulta |
| `ajuda-e-suporte` | Perfil - Ajuda e suporte | `3762:3707` | — | Sem central/tickets de suporte em /mobile |
| `adicionar-cartao` | Perfil - Adicionar cartão | `3762:3775` | — | Sem cadastro de cartão em /mobile |
| `categorias-geladeira` | Estoque - Categorias (Geladeira) | `3762:3803` | M05 ou M06; storagePlace=FRIDGE; category opcional | Disponível |
| `categorias-freezer` | Estoque - Categorias (Freezer) | `3762:3871` | M05 ou M06; storagePlace=FREEZER; category opcional | Disponível |
| `categorias-despensa` | Estoque - Categorias (Despensa) | `3762:3933` | M05 ou M06; storagePlace=PANTRY; category opcional | Disponível |
| `detalhe-da-receita` | Receita - Detalhes da receita | `3762:4112` | M15, M16, M17 | Disponível; usar ID real, não fixar /recipes/1 |
| `preferencias-de-alimentos` | Configurações - Preferências de alimentos | `3762:4160` | — | Sem preferências alimentares em /mobile |
| `unidades-e-medidas` | Configurações - Unidades e medidas | `3762:4195` | — | Enum de unidades existe nos dados; não há persistência de preferências em /mobile |
| `dispositivos-conectados` | Configurações - Dispositivos conectados | `3762:4225` | — | Sem gestão de dispositivos em /mobile |
| `privacidade` | Configurações - Privacidade | `3762:4245` | — | Sem gestão de privacidade em /mobile |
| `alterar-senha` | Configurações - Alterar senha | `3762:4270` | — | Sem troca de senha em /mobile |
| `informacoes-da-conta` | Configurações - Informações da Conta | `3762:4296` | M03 | Somente leitura; atualização não montada em /mobile |
| `verificacao-de-email` | Configurações - Verificação de e-mail | `3762:4314` | M03 somente para exibir e-mail | Sem envio/verificação de código em /mobile |
| `configuracoes` | Configurações | `3762:4322` | — | Sem leitura/escrita de preferências em /mobile; M03 serve apenas dados do usuário |
| `ajuda-enviar-solicitacao` | Ajuda e suporte - Enviar uma solicitação | `3762:4369` | — | Sem envio de solicitação de suporte em /mobile |
| `adicionar-item-lista` | Lista de compras - Adicionar item | `3821:4496` | — | Sem adição em lista de compras nem criação de lote em /mobile |

## 7. Lacunas que o time mobile precisa considerar

1. **Sessão:** login entrega accessToken/refreshToken, mas refresh, logout, recuperação e troca de senha não estão montados sob `/mobile`.
2. **Criação de estoque/alimento:** o mobile consulta, edita, movimenta e remove lotes existentes. Não há POST mobile para criar grupo/estoque/produto/lote. Esses endpoints existem em outros canais/upstream, mas não devem ser apresentados como contratos mobile já entregues.
3. **Família, compras, preferências e assinatura:** não há rotas montadas nesses domínios no canal mobile, mesmo existindo serviços internos e rotas `/web` para vários deles. Uma função em `coreApiService` ou `MobileUserService` não é, por si só, uma rota HTTP publicada.
4. **Chat humano:** não há conversas, mensagens, reações ou upload de anexos publicados em `/mobile`. M19 é somente chat IA mediado pela Core.
5. **IA:** sem streaming/histórico mobile; revisar a criação/associação de receita em resposta conversacional e o contexto de credenciais por usuário antes de ampliar o uso além da conta local configurada.
6. **QR/nota fiscal e MoneySaving:** M27–M29 cobrem leitura por payload QR, consulta e confirmação; não há upload de imagem/PDF. MoneySaving ainda não tem dashboard financeiro tipado.
7. **Anúncios:** mobile publica apenas leitura de ativos e contagem de impressão/clique; CRUD de campanhas e métricas de anunciante não estão neste canal.

As rotas web usam um fluxo próprio de sessão/cookies e validação de origem em mutações. Não trate `/web/...` como substituto nativo automaticamente: publique/defina o contrato mobile que faltar com o time de backend.

## 8. Campos opcionais de resposta — resumo para o parser mobile

| Objeto | Metadados que podem faltar/ser null |
| --- | --- |
| User | `profilePictureUrl`, `birthDate` (legados/origem externa) |
| Product | `brand`, `imageUrl`, `ownerGroupId` |
| StockProduct | `minimalQuantity`, `batch`, `productStatus`; aceitar metadados legados sem forçar valor artificial |
| StockMovement | `observation`, `date`, `balanceAfter` (legados) |
| Recipe | `description`, `instructions`; ingredientes podem ser lista vazia |
| Ingredient | `quantity`, `unit`, `inStock`, `expireDate` e timestamps de contexto; campos null são omitidos pelo DTO |
| IngredientAvailability | `requiredQuantity`, `unit` quando não definidos na receita |
| AiRecipeChatResponse | campos de receita/sugestão conforme resposta; `sessionId`/`chatMessage` null na listagem persistida M18 |
| Notification | `groupId`, `referenceId`, `readAt` |
| Advertisement | `destinationUrl`, `price`, `startDate`, `endDate` |

Essa tolerância de leitura não altera os requisitos de escrita especificados em cada endpoint. Não envie o objeto inteiro recebido de volta como body de edição.

## 9. Fontes e manutenção

Fontes inspecionadas para esta versão:

- `src/app.ts` e `src/channels/mobile/index.ts`: prefixos e grupos realmente montados.
- `src/channels/mobile/{user,inventory,recipes,notifications,advertisements}/*.route.ts`: métodos, paths, schemas locais, status e composição dos payloads.
- `src/schemas/auth.schema.ts`, `src/schemas/core-api.schema.ts`: validação de cadastro/login, edição e movimentação.
- `src/middlewares/auth.middleware.ts`, `src/middlewares/error-handler.middleware.ts`, `src/utils/api-client.ts`: autenticação e erro HTTP.
- `src/services/{auth,profile,core-api}.service.ts`: encaminhamento para a Core.
- DTOs, controllers, mappers e serviços correspondentes em `frigus-core-api/src/main/java/com/frigus/coreapi` para campos de saída, nulabilidade de transporte e regras de negócio.
- Cadastro de 60 aliases em `frigus-react-web/src/routes/mobile-aliases.ts`; nomes/nodes da referência local `docs/mobile-figma-aliases-e-pendencias.md`. Os nodes não foram reinspecionados no Figma nesta entrega.

Ao alterar uma rota mobile, atualizar sua entrada Mxx, JSONs, parâmetros e o mapa de aliases. JSON de exemplo não representa default do servidor, salvo quando o default está declarado na tabela de parâmetros.
