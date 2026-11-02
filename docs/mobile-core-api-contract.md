# Contrato do BFF para o app mobile

> Contrato consolidado com o OpenAPI-base e os endpoints de tela implementados no Core em 27/10/2026. Os exemplos JSON abaixo são modelos dos schemas; IDs, datas, valores e credenciais são ilustrativos. O BFF mantém os nomes e formatos definidos pelo Core API.

## Base URL e autenticação

- Base local: `http://localhost:3001/mobile` (ajuste para o host do ambiente).
- Envie `Authorization: Bearer <accessToken>` nas operações protegidas. Login e cadastro mobile usam `/user/login` e `/user/register`.
- Os endpoints agregados mobile incluem `/home`, `/inventory`, `/recipes`, `/notifications`, `/advertisements` e `/commercial/groups/{groupId}/...`. O mapa tela a tela está em [mobile-screen-api-map.md](mobile-screen-api-map.md). As operações Core API listadas abaixo também podem ser chamadas pelo proxy em `/core`.
- O proxy preserva método HTTP, query string, JSON, status de sucesso e corpo de resposta. Erros do Core API seguem o envelope de erro do BFF.
- `204 No Content` não tem response body. Caminhos `{id}` devem ser substituídos por IDs reais. Paginação segue `page` e `size` quando indicada no OpenAPI.
- O contrato cobre 179 pares método/rota: os 169 do OpenAPI-base e 10 operações novas de tela, detalhadas abaixo e no [mapa mobile](mobile-screen-api-map.md). Os endpoints Core novos são `/profile/app-settings`, `/support/requests`, `/profile/sessions` e `/profile/email-verification`.
- Os endpoints de tela BFF `/home` e `/commercial/.../money-saving` também estão especificados e exemplificados no mapa mobile. MoneySaving exige conta comercial e entitlement habilitado no plano.

## Endpoints de autenticação mobile existentes

### `POST /mobile/user/login`

**Request**

```json
{
  "email": "mobile@example.com",
  "rawPassword": "SenhaSegura123!"
}
```

**Response de sucesso**

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh-token>",
  "user": {
    "id": "<uuid>",
    "name": "Pessoa",
    "profilePictureUrl": null,
    "email": "mobile@example.com",
    "emailVerified": false,
    "accountType": "DOMESTIC",
    "birthDate": "01/01/1990"
  }
}
```

### `POST /mobile/user/register`

**Request**

```json
{
  "name": "Pessoa",
  "birthDate": "01/01/1990",
  "email": "mobile@example.com",
  "rawPassword": "SenhaSegura123!",
  "accountType": "DOMESTIC"
}
```

**Response de sucesso**

```json
{
  "id": "<uuid>",
  "name": "Pessoa",
  "profilePictureUrl": null,
  "email": "mobile@example.com",
  "emailVerified": false,
  "accountType": "DOMESTIC",
  "birthDate": "01/01/1990"
}
```

### `GET /mobile/user/profile`

**Request**

Sem body.

**Response de sucesso**

```json
{
  "id": "<uuid>",
  "name": "Pessoa",
  "profilePictureUrl": null,
  "email": "mobile@example.com",
  "emailVerified": false,
  "accountType": "DOMESTIC",
  "birthDate": "01/01/1990"
}
```

## Proxy completo do Core API

O proxy recebe o caminho original do Core depois do prefixo `/mobile/core`. Exemplo: `GET /groups` no Core é `GET /mobile/core/groups` no BFF. Requisições de mutação devem usar o método e o JSON definidos em cada operação abaixo.

### Contratos novos usados pelas telas mobile

As dez operações seguintes foram adicionadas ao Core para cobrir as telas de configurações, dispositivos, verificação de e-mail e suporte. Todas exigem `Authorization: Bearer <accessToken>`.

#### `GET /mobile/core/profile/app-settings`

**Request JSON:** sem body.

**Response `200`:**

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

#### `PUT /mobile/core/profile/app-settings`

**Request JSON:** envie o objeto completo; o `PUT` substitui todas as configurações.

```json
{
  "foodPreferences": {
    "preferences": ["VEGETARIAN", "AVOID_SEAFOOD"],
    "restrictions": ["LACTOSE_FREE", "GLUTEN_FREE"],
    "quickRecipesEnabled": true,
    "budgetRecipesEnabled": false
  },
  "units": { "weight": "G", "volume": "ML", "temperature": "CELSIUS" },
  "privacy": {
    "usageDataCollectionAllowed": false,
    "personalizedSuggestionsAllowed": true
  }
}
```

**Response `200`:** o mesmo objeto enviado, após persistência.

```json
{
  "foodPreferences": {
    "preferences": ["VEGETARIAN", "AVOID_SEAFOOD"],
    "restrictions": ["LACTOSE_FREE", "GLUTEN_FREE"],
    "quickRecipesEnabled": true,
    "budgetRecipesEnabled": false
  },
  "units": { "weight": "G", "volume": "ML", "temperature": "CELSIUS" },
  "privacy": {
    "usageDataCollectionAllowed": false,
    "personalizedSuggestionsAllowed": true
  }
}
```

#### `GET /mobile/core/profile/sessions`

**Request JSON:** sem body.

**Response `200`:**

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

#### `DELETE /mobile/core/profile/sessions/{sessionId}`

**Request JSON:** sem body. Use o `id` retornado na lista de sessões.

**Response:** HTTP `204 No Content`, sem JSON. A sessão revogada deixa de aceitar access e refresh tokens.

#### `GET /mobile/core/profile/email-verification`

**Request JSON:** sem body.

**Response `200`:**

```json
{ "email": "mobile@example.com", "verified": false }
```

#### `POST /mobile/core/profile/email-verification/request`

**Request JSON:** sem body. Com o provedor de e-mail configurado, o Core envia um código de seis dígitos para o e-mail da conta; respeite o intervalo mínimo de 60 segundos entre solicitações. Se o envio falhar, a resposta é `503` e a solicitação pode ser repetida.

**Response:** HTTP `204 No Content`, sem JSON.

#### `POST /mobile/core/profile/email-verification/verify`

**Request JSON:**

```json
{ "code": "123456" }
```

**Response `200`:**

```json
{ "email": "mobile@example.com", "verified": true }
```

O código expira em 10 minutos e permite até cinco tentativas.

#### `POST /mobile/core/support/requests`

**Request JSON:**

```json
{
  "subject": "Não consigo importar uma nota",
  "description": "A leitura do QR Code termina, mas os itens não aparecem no estoque."
}
```

**Response `201`:**

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

#### `GET /mobile/core/support/requests`

**Request JSON:** sem body. `page` começa em zero; `size` define o limite de itens.

**Response `200`:**

```json
{
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000020",
      "protocol": "FRG-00000000",
      "status": "OPEN",
      "subject": "Não consigo importar uma nota",
      "description": "A leitura do QR Code termina, mas os itens não aparecem no estoque.",
      "createdAt": "2026-10-27T12:30:00Z",
      "updatedAt": "2026-10-27T12:30:00Z"
    }
  ],
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

#### `GET /mobile/core/support/requests/{id}`

**Request JSON:** sem body. O `{id}` é o UUID retornado ao abrir o chamado.

**Response `200`:**

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

Os status possíveis são `OPEN`, `IN_PROGRESS` e `RESOLVED`.

### `GET /mobile/core/stocks/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "groupId": "00000000-0000-4000-8000-000000000001",
  "name": "string"
}
```

### `PUT /mobile/core/stocks/{id}`

**Request JSON**

```json
{
  "groupId": "00000000-0000-4000-8000-000000000001",
  "name": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "groupId": "00000000-0000-4000-8000-000000000001",
  "name": "string"
}
```

### `DELETE /mobile/core/stocks/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200` sem body.

### `GET /mobile/core/stock-products/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "productId": 1,
  "product": {
    "id": 1,
    "name": "string",
    "category": "FRUIT",
    "storagePlace": "FRIDGE",
    "unitPrice": 1.0,
    "unitOfMeasure": "KILOGRAM",
    "brand": "string",
    "imageUrl": "string"
  },
  "stockId": 1,
  "quantity": 1,
  "initialQuantity": 1,
  "minimalQuantity": 1,
  "purchaseUnitPrice": 1.0,
  "expireDate": "2026-10-27",
  "productStatus": "FRESH",
  "category": "FRUIT",
  "batch": "string"
}
```

### `PUT /mobile/core/stock-products/{id}`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "productId": 1,
  "product": {
    "id": 1,
    "name": "string",
    "category": "FRUIT",
    "storagePlace": "FRIDGE",
    "unitPrice": 1.0,
    "unitOfMeasure": "KILOGRAM",
    "brand": "string",
    "imageUrl": "string"
  },
  "stockId": 1,
  "quantity": 1,
  "initialQuantity": 1,
  "minimalQuantity": 1,
  "purchaseUnitPrice": 1.0,
  "expireDate": "2026-10-27",
  "productStatus": "FRESH",
  "category": "FRUIT",
  "batch": "string"
}
```

### `DELETE /mobile/core/stock-products/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200` sem body.

### `PUT /mobile/core/shopping-lists/{listId}/items/{itemId}`

Update an item's quantity or status

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "listId": "00000000-0000-4000-8000-000000000001",
  "productId": 1,
  "productName": "string",
  "productCategory": "string",
  "productMeasure": "string",
  "quantity": 1,
  "estimatedTotal": 1.0,
  "status": "PENDING",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `DELETE /mobile/core/shopping-lists/{listId}/items/{itemId}`

Remove an item from a shopping list

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/shopping-lists/{id}`

Get a specific shopping list with its items and counters

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `PUT /mobile/core/shopping-lists/{id}`

Update shopping list date or status

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `DELETE /mobile/core/shopping-lists/{id}`

Delete a shopping list

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/recipes/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "instructions": "string",
  "domesticOnly": true,
  "active": true,
  "createdAt": "2026-10-27T12:00:00Z",
  "favorite": true,
  "ingredients": [
    {
      "id": 1,
      "recipeId": 1,
      "recipeName": "string",
      "productId": 1,
      "productName": "string",
      "productCategory": "FRUIT",
      "productUnitOfMeasure": "string",
      "quantity": 1.0,
      "unit": "string",
      "required": true,
      "inStock": true,
      "expireDate": "2026-10-27",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `PUT /mobile/core/recipes/{id}`

**Request JSON**

```json
{
  "name": "string",
  "instructions": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "instructions": "string",
  "domesticOnly": true,
  "active": true,
  "createdAt": "2026-10-27T12:00:00Z",
  "favorite": true,
  "ingredients": [
    {
      "id": 1,
      "recipeId": 1,
      "recipeName": "string",
      "productId": 1,
      "productName": "string",
      "productCategory": "FRUIT",
      "productUnitOfMeasure": "string",
      "quantity": 1.0,
      "unit": "string",
      "required": true,
      "inStock": true,
      "expireDate": "2026-10-27",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `DELETE /mobile/core/recipes/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `PUT /mobile/core/recipes/{id}/favorite`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `DELETE /mobile/core/recipes/{id}/favorite`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/profile`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `PUT /mobile/core/profile`

**Request JSON**

```json
{
  "name": "string",
  "birthDate": "2026-10-27"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `PATCH /mobile/core/profile`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `DELETE /mobile/core/profile`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200` sem body.

### `GET /mobile/core/profile/preferences`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "expirationAlertsEnabled": true,
  "lowStockAlertsEnabled": true,
  "shoppingRemindersEnabled": true,
  "weeklySummaryEnabled": true,
  "theme": "string"
}
```

### `PUT /mobile/core/profile/preferences`

**Request JSON**

```json
{
  "theme": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "expirationAlertsEnabled": true,
  "lowStockAlertsEnabled": true,
  "shoppingRemindersEnabled": true,
  "weeklySummaryEnabled": true,
  "theme": "string"
}
```

### `GET /mobile/core/products/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 1.0,
  "unitOfMeasure": "KILOGRAM",
  "brand": "string",
  "imageUrl": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "ownerGroupId": "00000000-0000-4000-8000-000000000001"
}
```

### `PUT /mobile/core/products/{id}`

**Request JSON**

```json
{
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 0.0,
  "unitOfMeasure": "KILOGRAM"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 1.0,
  "unitOfMeasure": "KILOGRAM",
  "brand": "string",
  "imageUrl": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "ownerGroupId": "00000000-0000-4000-8000-000000000001"
}
```

### `DELETE /mobile/core/products/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/plans/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "planCode": "string",
  "name": "string",
  "description": "string",
  "price": 1.0,
  "billingInterval": "MONTHLY",
  "active": true,
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "benefits": [
    {
      "code": "string",
      "label": "string",
      "enabled": true,
      "limit": 1
    }
  ]
}
```

### `PUT /mobile/core/plans/{id}`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "planCode": "string",
  "name": "string",
  "description": "string",
  "price": 1.0,
  "billingInterval": "MONTHLY",
  "active": true,
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "benefits": [
    {
      "code": "string",
      "label": "string",
      "enabled": true,
      "limit": 1
    }
  ]
}
```

### `DELETE /mobile/core/plans/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/ingredients/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "recipeId": 1,
  "recipeName": "string",
  "productId": 1,
  "productName": "string",
  "productCategory": "FRUIT",
  "productUnitOfMeasure": "string",
  "quantity": 1.0,
  "unit": "string",
  "required": true,
  "inStock": true,
  "expireDate": "2026-10-27",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `PUT /mobile/core/ingredients/{id}`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "recipeId": 1,
  "recipeName": "string",
  "productId": 1,
  "productName": "string",
  "productCategory": "FRUIT",
  "productUnitOfMeasure": "string",
  "quantity": 1.0,
  "unit": "string",
  "required": true,
  "inStock": true,
  "expireDate": "2026-10-27",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `DELETE /mobile/core/ingredients/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200` sem body.

### `GET /mobile/core/groups/{id}`

Obter detalhes e membros do grupo por ID

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `PUT /mobile/core/groups/{id}`

Atualizar informações do grupo

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `DELETE /mobile/core/groups/{id}`

Excluir grupo (soft delete)

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `PUT /mobile/core/groups/{groupId}/products/{id}`

**Request JSON**

```json
{
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 0.0,
  "unitOfMeasure": "KILOGRAM"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 1.0,
  "unitOfMeasure": "KILOGRAM",
  "brand": "string",
  "imageUrl": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "ownerGroupId": "00000000-0000-4000-8000-000000000001"
}
```

### `DELETE /mobile/core/groups/{groupId}/products/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/groups/{groupId}/food-purchases/{purchaseId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "purchaseDate": "2026-10-27",
  "source": "string",
  "receiptReference": "string",
  "version": 1,
  "total": 1.0,
  "lines": [
    {
      "id": 1,
      "stockKey": 1,
      "stockProductId": 1,
      "productName": "string",
      "category": "string",
      "categoryGroup": "string",
      "unitOfMeasure": "string",
      "expireDate": "2026-10-27",
      "quantity": 1,
      "unitPrice": 1.0,
      "total": 1.0
    }
  ]
}
```

### `PUT /mobile/core/groups/{groupId}/food-purchases/{purchaseId}`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "purchaseDate": "2026-10-27",
  "source": "string",
  "receiptReference": "string",
  "version": 1,
  "total": 1.0,
  "lines": [
    {
      "id": 1,
      "stockKey": 1,
      "stockProductId": 1,
      "productName": "string",
      "category": "string",
      "categoryGroup": "string",
      "unitOfMeasure": "string",
      "expireDate": "2026-10-27",
      "quantity": 1,
      "unitPrice": 1.0,
      "total": 1.0
    }
  ]
}
```

### `DELETE /mobile/core/groups/{groupId}/food-purchases/{purchaseId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/conversations/{id}/messages/{messageId}/reactions`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "userId": "00000000-0000-4000-8000-000000000001",
    "emoji": "string"
  }
]
```

### `PUT /mobile/core/conversations/{id}/messages/{messageId}/reactions`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
[
  {
    "userId": "00000000-0000-4000-8000-000000000001",
    "emoji": "string"
  }
]
```

### `DELETE /mobile/core/conversations/{id}/messages/{messageId}/reactions`

Query: `emoji` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "userId": "00000000-0000-4000-8000-000000000001",
    "emoji": "string"
  }
]
```

### `PUT /mobile/core/commercial/groups/{groupId}/expenses/{id}`

**Request JSON**

```json
{
  "description": "string",
  "category": "string",
  "amount": 0.0,
  "expenseDate": "2026-10-27"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "description": "string",
  "category": "string",
  "amount": 1.0,
  "expenseDate": "2026-10-27",
  "supplier": "string",
  "shoppingListId": "00000000-0000-4000-8000-000000000001",
  "createdBy": "00000000-0000-4000-8000-000000000001"
}
```

### `DELETE /mobile/core/commercial/groups/{groupId}/expenses/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `PUT /mobile/core/advertisements/{id}`

**Request JSON**

```json
{
  "name": "string",
  "productName": "string",
  "category": "string",
  "description": "string",
  "imageUrl": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "advertiserId": "00000000-0000-4000-8000-000000000001",
  "advertiserName": "string",
  "name": "string",
  "productName": "string",
  "category": "string",
  "description": "string",
  "imageUrl": "string",
  "destinationUrl": "string",
  "price": 1.0,
  "startDate": "2026-10-27",
  "endDate": "2026-10-27",
  "status": "DRAFT",
  "impressions": 1,
  "clicks": 1,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/transactions/{transactionId}/cancel`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "status": "PENDING",
  "amount": 1.0,
  "paymentMethod": "PIX",
  "idempotencyKey": "string",
  "planCode": "string",
  "errorMessage": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "queuedAt": "2026-10-27T12:00:00Z",
  "processedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/transactions/checkout`

**Request JSON**

```json
{
  "planCode": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "status": "PENDING",
  "amount": 1.0,
  "paymentMethod": "PIX",
  "idempotencyKey": "string",
  "planCode": "string",
  "errorMessage": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "queuedAt": "2026-10-27T12:00:00Z",
  "processedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/subscriptions/{id}/cancel`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `POST /mobile/core/subscriptions/me/reactivate`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `POST /mobile/core/subscriptions/me/cancel`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `POST /mobile/core/subscriptions/billing/run`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "evaluatedCount": 1,
  "transactionsGeneratedCount": 1,
  "expiredCount": 1,
  "skippedCount": 1,
  "errorsCount": 1,
  "errorMessages": [
    "string"
  ],
  "executedAt": "2026-10-27T12:00:00Z",
  "executionDurationMs": 1
}
```

### `GET /mobile/core/stocks`

Query: `groupId` (obrigatório); `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "groupId": "00000000-0000-4000-8000-000000000001",
      "name": "string"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/stocks`

**Request JSON**

```json
{
  "groupId": "00000000-0000-4000-8000-000000000001",
  "name": "string"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "groupId": "00000000-0000-4000-8000-000000000001",
  "name": "string"
}
```

### `GET /mobile/core/stock-products`

Query: `stockId` (obrigatório); `category` (opcional); `storagePlace` (opcional); `q` (opcional); `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "productId": 1,
      "product": {
        "id": 1,
        "name": "string",
        "category": "FRUIT",
        "storagePlace": "FRIDGE",
        "unitPrice": 1.0,
        "unitOfMeasure": "KILOGRAM",
        "brand": "string",
        "imageUrl": "string"
      },
      "stockId": 1,
      "quantity": 1,
      "initialQuantity": 1,
      "minimalQuantity": 1,
      "purchaseUnitPrice": 1.0,
      "expireDate": "2026-10-27",
      "productStatus": "FRESH",
      "category": "FRUIT",
      "batch": "string"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/stock-products`

**Request JSON**

```json
{
  "productId": 1,
  "stockId": 1,
  "quantity": 1,
  "expireDate": "2026-10-27"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "productId": 1,
  "product": {
    "id": 1,
    "name": "string",
    "category": "FRUIT",
    "storagePlace": "FRIDGE",
    "unitPrice": 1.0,
    "unitOfMeasure": "KILOGRAM",
    "brand": "string",
    "imageUrl": "string"
  },
  "stockId": 1,
  "quantity": 1,
  "initialQuantity": 1,
  "minimalQuantity": 1,
  "purchaseUnitPrice": 1.0,
  "expireDate": "2026-10-27",
  "productStatus": "FRESH",
  "category": "FRUIT",
  "batch": "string"
}
```

### `GET /mobile/core/stock-products/{stockProductId}/movements`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "stockProductId": 1,
      "userId": "00000000-0000-4000-8000-000000000001",
      "movementType": "IN",
      "quantity": 1,
      "reasonCode": "string",
      "balanceAfter": 1,
      "date": "2026-10-27T12:00:00Z",
      "observation": "string",
      "purpose": "string"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/stock-products/{stockProductId}/movements`

**Request JSON**

```json
{
  "movementType": "IN",
  "quantity": 1
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "stockProductId": 1,
  "userId": "00000000-0000-4000-8000-000000000001",
  "movementType": "IN",
  "quantity": 1,
  "reasonCode": "string",
  "balanceAfter": 1,
  "date": "2026-10-27T12:00:00Z",
  "observation": "string",
  "purpose": "string"
}
```

### `GET /mobile/core/shopping-lists`

Get a paginated list of shopping lists

Query: `stockId` (opcional); `groupId` (opcional); `status` (opcional); `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "stockId": 1,
      "name": "string",
      "stockName": "string",
      "date": "2026-10-27",
      "status": "OPEN",
      "totalItems": 1,
      "purchasedItems": 1,
      "pendingItems": 1,
      "estimatedTotal": 1.0,
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z",
      "items": [
        {
          "id": "...",
          "listId": "...",
          "productId": "...",
          "productName": "...",
          "productCategory": "...",
          "productMeasure": "...",
          "quantity": "...",
          "estimatedTotal": "...",
          "status": "PENDING",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/shopping-lists`

Create a new shopping list

**Request JSON**

```json
{
  "stockId": 1
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `GET /mobile/core/shopping-lists/{listId}/items`

Get all items of a shopping list (paginated)

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/shopping-lists/{listId}/items`

Add an item to a shopping list

**Request JSON**

```json
{
  "productId": 1,
  "quantity": 1
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "listId": "00000000-0000-4000-8000-000000000001",
  "productId": 1,
  "productName": "string",
  "productCategory": "string",
  "productMeasure": "string",
  "quantity": 1,
  "estimatedTotal": 1.0,
  "status": "PENDING",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/shopping-lists/{listId}/items/batch`

Add multiple items to a shopping list

**Request JSON**

```json
[
  {
    "productId": 1,
    "quantity": 1
  }
]
```

**Response de sucesso**

HTTP `201` sem body.

### `POST /mobile/core/shopping-lists/from-low-stock`

Generate a new shopping list automatically from low stock products

Query: `stockId` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `GET /mobile/core/recipes`

Query: `name` (opcional); `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "instructions": "string",
      "domesticOnly": true,
      "active": true,
      "createdAt": "2026-10-27T12:00:00Z",
      "favorite": true,
      "ingredients": [
        {
          "id": "...",
          "recipeId": "...",
          "recipeName": "...",
          "productId": "...",
          "productName": "...",
          "productCategory": "FRUIT",
          "productUnitOfMeasure": "...",
          "quantity": "...",
          "unit": "...",
          "required": "...",
          "inStock": "...",
          "expireDate": "...",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/recipes`

**Request JSON**

```json
{
  "name": "string",
  "instructions": "string"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "instructions": "string",
  "domesticOnly": true,
  "active": true,
  "createdAt": "2026-10-27T12:00:00Z",
  "favorite": true,
  "ingredients": [
    {
      "id": 1,
      "recipeId": 1,
      "recipeName": "string",
      "productId": 1,
      "productName": "string",
      "productCategory": "FRUIT",
      "productUnitOfMeasure": "string",
      "quantity": 1.0,
      "unit": "string",
      "required": true,
      "inStock": true,
      "expireDate": "2026-10-27",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `POST /mobile/core/receipts/{receiptId}/confirm`

**Request JSON**

```json
{
  "items": [
    {
      "lineId": "00000000-0000-4000-8000-000000000001",
      "action": "string"
    }
  ]
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "receiptId": "00000000-0000-4000-8000-000000000001",
  "status": "string",
  "importedItems": [
    {
      "lineId": "00000000-0000-4000-8000-000000000001",
      "stockProductId": 1,
      "productId": 1,
      "quantity": 1
    }
  ],
  "ignoredLineIds": [
    "00000000-0000-4000-8000-000000000001"
  ]
}
```

### `POST /mobile/core/receipts/scan`

**Request JSON**

```json
{
  "stockId": 1,
  "qrPayload": "string"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "receiptId": "00000000-0000-4000-8000-000000000001",
  "status": "string",
  "invoice": {
    "documentType": "string",
    "accessKey": "string",
    "issuerName": "string",
    "issuedAt": "2026-10-27T12:00:00Z",
    "totalAmount": 1.0
  },
  "items": [
    {
      "lineId": "00000000-0000-4000-8000-000000000001",
      "action": "string",
      "productId": 1,
      "quantity": 1,
      "expireDate": "2026-10-27"
    }
  ],
  "warnings": [
    "string"
  ]
}
```

### `GET /mobile/core/products`

Query: `groupId` (opcional); `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "name": "string",
      "category": "FRUIT",
      "storagePlace": "FRIDGE",
      "unitPrice": 1.0,
      "unitOfMeasure": "KILOGRAM",
      "brand": "string",
      "imageUrl": "string",
      "createdAt": "2026-10-27T12:00:00Z",
      "ownerGroupId": "00000000-0000-4000-8000-000000000001"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/products`

**Request JSON**

```json
{
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 0.0,
  "unitOfMeasure": "KILOGRAM"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 1.0,
  "unitOfMeasure": "KILOGRAM",
  "brand": "string",
  "imageUrl": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "ownerGroupId": "00000000-0000-4000-8000-000000000001"
}
```

### `GET /mobile/core/plans`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "planCode": "string",
      "name": "string",
      "description": "string",
      "price": 1.0,
      "billingInterval": "MONTHLY",
      "active": true,
      "limits": {
        "planCode": "FREE",
        "maxGroupsCreated": 1,
        "maxGroupMembers": 1,
        "maxStocks": 1,
        "maxProductsPerStock": 1,
        "allowOwnProducts": true,
        "allowSavedRecipes": true,
        "allowMoneySaving": true,
        "costPerPublishedAd": 1.0,
        "hasMonthlyReport": true,
        "enterprise": true
      },
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z",
      "benefits": [
        {
          "code": "...",
          "label": "...",
          "enabled": "...",
          "limit": "..."
        }
      ]
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/plans`

**Request JSON**

```json
{
  "planCode": "string",
  "name": "string",
  "price": 0.0
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "planCode": "string",
  "name": "string",
  "description": "string",
  "price": 1.0,
  "billingInterval": "MONTHLY",
  "active": true,
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "benefits": [
    {
      "code": "string",
      "label": "string",
      "enabled": true,
      "limit": 1
    }
  ]
}
```

### `POST /mobile/core/plans/select`

**Request JSON**

```json
{
  "planCode": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "status": "PENDING",
  "amount": 1.0,
  "paymentMethod": "PIX",
  "idempotencyKey": "string",
  "planCode": "string",
  "errorMessage": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "queuedAt": "2026-10-27T12:00:00Z",
  "processedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/notifications/ad-clicks`

Registrar o total de cliques para avisos empresariais a cada 2500 cliques

**Request JSON**

```json
{
  "totalClicks": 1
}
```

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/ingredients`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "recipeId": 1,
      "recipeName": "string",
      "productId": 1,
      "productName": "string",
      "productCategory": "FRUIT",
      "productUnitOfMeasure": "string",
      "quantity": 1.0,
      "unit": "string",
      "required": true,
      "inStock": true,
      "expireDate": "2026-10-27",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/ingredients`

**Request JSON**

```json
{
  "recipeId": 1,
  "productId": 1
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "recipeId": 1,
  "recipeName": "string",
  "productId": 1,
  "productName": "string",
  "productCategory": "FRUIT",
  "productUnitOfMeasure": "string",
  "quantity": 1.0,
  "unit": "string",
  "required": true,
  "inStock": true,
  "expireDate": "2026-10-27",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/groups`

Listar grupos do usuário autenticado

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "ownerId": "00000000-0000-4000-8000-000000000001",
    "ownerName": "string",
    "isOwner": true,
    "defaultConversationId": "00000000-0000-4000-8000-000000000001",
    "name": "string",
    "bannerPicture": "string",
    "timeZone": "string",
    "membersCount": 1,
    "members": [
      {
        "userId": "00000000-0000-4000-8000-000000000001",
        "name": "string",
        "email": "string",
        "isOwner": true,
        "joinedAt": "2026-10-27T12:00:00Z",
        "memberRole": "EDITOR"
      }
    ],
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z"
  }
]
```

### `POST /mobile/core/groups`

Criar um novo grupo de pessoas

**Request JSON**

```json
{
  "name": "string"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/groups/{id}/members`

Adicionar novo membro ao grupo respeitando o limite do plano

**Request JSON**

```json
{
  "userId": "00000000-0000-4000-8000-000000000001"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/groups/{groupId}/products`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": 1,
    "name": "string",
    "category": "FRUIT",
    "storagePlace": "FRIDGE",
    "unitPrice": 1.0,
    "unitOfMeasure": "KILOGRAM",
    "brand": "string",
    "imageUrl": "string",
    "createdAt": "2026-10-27T12:00:00Z",
    "ownerGroupId": "00000000-0000-4000-8000-000000000001"
  }
]
```

### `POST /mobile/core/groups/{groupId}/products`

**Request JSON**

```json
{
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 0.0,
  "unitOfMeasure": "KILOGRAM"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "name": "string",
  "category": "FRUIT",
  "storagePlace": "FRIDGE",
  "unitPrice": 1.0,
  "unitOfMeasure": "KILOGRAM",
  "brand": "string",
  "imageUrl": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "ownerGroupId": "00000000-0000-4000-8000-000000000001"
}
```

### `GET /mobile/core/groups/{groupId}/invitations`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "groupId": "00000000-0000-4000-8000-000000000001",
    "email": "string",
    "name": "string",
    "memberRole": "EDITOR",
    "expiresAt": "2026-10-27T12:00:00Z",
    "acceptedAt": "2026-10-27T12:00:00Z",
    "revokedAt": "2026-10-27T12:00:00Z"
  }
]
```

### `POST /mobile/core/groups/{groupId}/invitations`

**Request JSON**

```json
{
  "email": "mobile@example.com",
  "memberRole": "EDITOR"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "email": "string",
  "name": "string",
  "memberRole": "EDITOR",
  "expiresAt": "2026-10-27T12:00:00Z",
  "acceptedAt": "2026-10-27T12:00:00Z",
  "revokedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/groups/{groupId}/food-purchases`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "purchaseDate": "2026-10-27",
  "source": "string",
  "receiptReference": "string",
  "version": 1,
  "total": 1.0,
  "lines": [
    {
      "id": 1,
      "stockKey": 1,
      "stockProductId": 1,
      "productName": "string",
      "category": "string",
      "categoryGroup": "string",
      "unitOfMeasure": "string",
      "expireDate": "2026-10-27",
      "quantity": 1,
      "unitPrice": 1.0,
      "total": 1.0
    }
  ]
}
```

### `POST /mobile/core/group-invitations/accept`

**Request JSON**

```json
{
  "token": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/discard`

Query: `groupId` (obrigatório); `page` (opcional); `size` (opcional); `sort` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "stockProductId": 1,
      "reason": "string",
      "reasonCode": "string",
      "canceledAt": "2026-10-27T12:00:00Z",
      "date": "2026-10-27T12:00:00Z",
      "quantity": 1
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/discard`

**Request JSON**

```json
{
  "stockProductId": 1,
  "quantity": 1
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "stockProductId": 1,
  "reason": "string",
  "reasonCode": "string",
  "canceledAt": "2026-10-27T12:00:00Z",
  "date": "2026-10-27T12:00:00Z",
  "quantity": 1
}
```

### `POST /mobile/core/conversations/{id}/participants`

Adicionar participante a uma conversa em grupo

**Request JSON**

```json
{
  "userId": "00000000-0000-4000-8000-000000000001"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "conversationType": "PRIVATE",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "groupName": "string",
  "name": "string",
  "pairKey": "string",
  "participants": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "joinedAt": "2026-10-27T12:00:00Z",
      "leftAt": "2026-10-27T12:00:00Z"
    }
  ],
  "latestMessage": {
    "id": 1,
    "conversationId": "00000000-0000-4000-8000-000000000001",
    "senderId": "00000000-0000-4000-8000-000000000001",
    "senderName": "string",
    "messageType": "TEXT",
    "content": "string",
    "relatedShoppingListProductId": 1,
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "attachments": [
      {
        "id": 1,
        "fileUrl": "string",
        "fileName": "string",
        "mimeType": "string",
        "fileSize": 1,
        "createdAt": "2026-10-27T12:00:00Z"
      }
    ]
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/conversations/{id}/messages`

Obter histórico paginado de mensagens de uma conversa

Query: `pageable` (obrigatório); `q` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "conversationId": "00000000-0000-4000-8000-000000000001",
      "senderId": "00000000-0000-4000-8000-000000000001",
      "senderName": "string",
      "messageType": "TEXT",
      "content": "string",
      "relatedShoppingListProductId": 1,
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z",
      "attachments": [
        {
          "id": "...",
          "fileUrl": "...",
          "fileName": "...",
          "mimeType": "...",
          "fileSize": "...",
          "createdAt": "..."
        }
      ]
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/conversations/{id}/messages`

Enviar mensagem via REST (também enviada para assinantes do WebSocket)

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": 1,
  "conversationId": "00000000-0000-4000-8000-000000000001",
  "senderId": "00000000-0000-4000-8000-000000000001",
  "senderName": "string",
  "messageType": "TEXT",
  "content": "string",
  "relatedShoppingListProductId": 1,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "attachments": [
    {
      "id": 1,
      "fileUrl": "string",
      "fileName": "string",
      "mimeType": "string",
      "fileSize": 1,
      "createdAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `POST /mobile/core/conversations/{id}/messages/{messageId}/read`

Marcar mensagem como lida

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `POST /mobile/core/conversations/private`

Iniciar ou obter conversa privada (1-a-1) com usuário que compartilha mesmo grupo de pessoas

**Request JSON**

```json
{
  "targetUserId": "00000000-0000-4000-8000-000000000001"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "conversationType": "PRIVATE",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "groupName": "string",
  "name": "string",
  "pairKey": "string",
  "participants": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "joinedAt": "2026-10-27T12:00:00Z",
      "leftAt": "2026-10-27T12:00:00Z"
    }
  ],
  "latestMessage": {
    "id": 1,
    "conversationId": "00000000-0000-4000-8000-000000000001",
    "senderId": "00000000-0000-4000-8000-000000000001",
    "senderName": "string",
    "messageType": "TEXT",
    "content": "string",
    "relatedShoppingListProductId": 1,
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "attachments": [
      {
        "id": 1,
        "fileUrl": "string",
        "fileName": "string",
        "mimeType": "string",
        "fileSize": 1,
        "createdAt": "2026-10-27T12:00:00Z"
      }
    ]
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/conversations/group`

Criar nova conversa de grupo (restrito a membros do grupo de pessoas)

**Request JSON**

```json
{
  "groupId": "00000000-0000-4000-8000-000000000001",
  "name": "string"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "conversationType": "PRIVATE",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "groupName": "string",
  "name": "string",
  "pairKey": "string",
  "participants": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "joinedAt": "2026-10-27T12:00:00Z",
      "leftAt": "2026-10-27T12:00:00Z"
    }
  ],
  "latestMessage": {
    "id": 1,
    "conversationId": "00000000-0000-4000-8000-000000000001",
    "senderId": "00000000-0000-4000-8000-000000000001",
    "senderName": "string",
    "messageType": "TEXT",
    "content": "string",
    "relatedShoppingListProductId": 1,
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "attachments": [
      {
        "id": 1,
        "fileUrl": "string",
        "fileName": "string",
        "mimeType": "string",
        "fileSize": 1,
        "createdAt": "2026-10-27T12:00:00Z"
      }
    ]
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/commercial/groups/{groupId}/expenses`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "groupId": "00000000-0000-4000-8000-000000000001",
      "description": "string",
      "category": "string",
      "amount": 1.0,
      "expenseDate": "2026-10-27",
      "supplier": "string",
      "shoppingListId": "00000000-0000-4000-8000-000000000001",
      "createdBy": "00000000-0000-4000-8000-000000000001"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `POST /mobile/core/commercial/groups/{groupId}/expenses`

**Request JSON**

```json
{
  "description": "string",
  "category": "string",
  "amount": 0.0,
  "expenseDate": "2026-10-27"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "description": "string",
  "category": "string",
  "amount": 1.0,
  "expenseDate": "2026-10-27",
  "supplier": "string",
  "shoppingListId": "00000000-0000-4000-8000-000000000001",
  "createdBy": "00000000-0000-4000-8000-000000000001"
}
```

### `POST /mobile/core/commercial/groups/{groupId}/employees/invitations`

**Request JSON**

```json
{
  "email": "mobile@example.com",
  "memberRole": "EDITOR"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "email": "string",
  "name": "string",
  "memberRole": "EDITOR",
  "expiresAt": "2026-10-27T12:00:00Z",
  "acceptedAt": "2026-10-27T12:00:00Z",
  "revokedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/auth/verify-reset-code`

**Request JSON**

```json
{
  "email": "mobile@example.com",
  "code": "string"
}
```

**Response de sucesso**

HTTP `204` sem body.

### `POST /mobile/core/auth/reset-password`

**Request JSON**

```json
{
  "email": "mobile@example.com",
  "code": "string",
  "newPassword": "string"
}
```

**Response de sucesso**

HTTP `204` sem body.

### `POST /mobile/core/auth/register`

**Request JSON**

```json
{
  "name": "Pessoa",
  "birthDate": "01/01/1990",
  "email": "mobile@example.com",
  "rawPassword": "SenhaSegura123!",
  "accountType": "DOMESTIC"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `POST /mobile/core/auth/refresh`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200`

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "string",
    "profilePictureUrl": "string",
    "email": "string",
    "accountType": "DOMESTIC",
    "birthDate": "2026-10-27"
  }
}
```

### `POST /mobile/core/auth/logout`

**Request JSON**

```json
{}
```

**Response de sucesso**

HTTP `200` sem body.

### `POST /mobile/core/auth/login`

**Request JSON**

```json
{
  "email": "mobile@example.com",
  "rawPassword": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "string",
    "profilePictureUrl": "string",
    "email": "string",
    "accountType": "DOMESTIC",
    "birthDate": "2026-10-27"
  }
}
```

### `POST /mobile/core/auth/google`

**Request JSON**

```json
{
  "idToken": "string"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "string",
    "profilePictureUrl": "string",
    "email": "string",
    "accountType": "DOMESTIC",
    "birthDate": "2026-10-27"
  }
}
```

### `POST /mobile/core/auth/forgot-password`

**Request JSON**

```json
{
  "email": "mobile@example.com"
}
```

**Response de sucesso**

HTTP `204` sem body.

### `POST /mobile/core/ai/recipes/chat`

**Request JSON**

```json
{
  "message": "string",
  "stockId": 1
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "sessionId": "string",
  "chatMessage": "string",
  "recipeId": 1,
  "recipeName": "string",
  "recipeDescription": "string",
  "recipeInstructions": "string",
  "ingredients": [
    {
      "id": 1,
      "recipeId": 1,
      "recipeName": "string",
      "productId": 1,
      "productName": "string",
      "productCategory": "FRUIT",
      "productUnitOfMeasure": "string",
      "quantity": 1.0,
      "unit": "string",
      "required": true,
      "inStock": true,
      "expireDate": "2026-10-27",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "suggestionId": 1,
  "matchedIngredients": 1,
  "missingIngredients": 1,
  "score": 1.0,
  "nearestExpireDate": "2026-10-27"
}
```

### `POST /mobile/core/advertisements`

**Request JSON**

```json
{
  "name": "string",
  "productName": "string",
  "category": "string",
  "description": "string",
  "imageUrl": "string"
}
```

**Response de sucesso**

HTTP `201`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "advertiserId": "00000000-0000-4000-8000-000000000001",
  "advertiserName": "string",
  "name": "string",
  "productName": "string",
  "category": "string",
  "description": "string",
  "imageUrl": "string",
  "destinationUrl": "string",
  "price": 1.0,
  "startDate": "2026-10-27",
  "endDate": "2026-10-27",
  "status": "DRAFT",
  "impressions": 1,
  "clicks": 1,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `POST /mobile/core/advertisements/{id}/impressions`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `POST /mobile/core/advertisements/{id}/clicks`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `PATCH /mobile/core/user/{id}/role`

**Request JSON**

```json
{
  "role": "USER"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `PATCH /mobile/core/user/{id}/password`

**Request JSON**

```json
{
  "newPassword": "string"
}
```

**Response de sucesso**

HTTP `200` sem body.

### `PATCH /mobile/core/user/{id}/account-type`

**Request JSON**

```json
{
  "accountType": "DOMESTIC"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `PATCH /mobile/core/subscriptions/{id}/status`

**Request JSON**

```json
{
  "status": "TRIAL"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `PATCH /mobile/core/shopping-lists/{listId}/items/{itemId}/status`

Update an item's status

Query: `status` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "listId": "00000000-0000-4000-8000-000000000001",
  "productId": 1,
  "productName": "string",
  "productCategory": "string",
  "productMeasure": "string",
  "quantity": 1,
  "estimatedTotal": 1.0,
  "status": "PENDING",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `PATCH /mobile/core/shopping-lists/{listId}/items/{itemId}/purchased`

Shortcut to mark an item as purchased

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "listId": "00000000-0000-4000-8000-000000000001",
  "productId": 1,
  "productName": "string",
  "productCategory": "string",
  "productMeasure": "string",
  "quantity": 1,
  "estimatedTotal": 1.0,
  "status": "PENDING",
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `PATCH /mobile/core/shopping-lists/{id}/reopen`

Manually reopen a shopping list

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `PATCH /mobile/core/shopping-lists/{id}/close`

Manually close a shopping list

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `PATCH /mobile/core/shopping-lists/{id}/cancel`

Manually cancel a shopping list

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "stockId": 1,
  "name": "string",
  "stockName": "string",
  "date": "2026-10-27",
  "status": "OPEN",
  "totalItems": 1,
  "purchasedItems": 1,
  "pendingItems": 1,
  "estimatedTotal": 1.0,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "items": [
    {
      "id": 1,
      "listId": "00000000-0000-4000-8000-000000000001",
      "productId": 1,
      "productName": "string",
      "productCategory": "string",
      "productMeasure": "string",
      "quantity": 1,
      "estimatedTotal": 1.0,
      "status": "PENDING",
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ]
}
```

### `PATCH /mobile/core/profile/password`

**Request JSON**

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response de sucesso**

HTTP `200` sem body.

### `PATCH /mobile/core/notifications/{id}/read`

Marcar uma notificação como lida

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "type": "PRODUCT_NEAR_EXPIRATION",
  "title": "string",
  "body": "string",
  "referenceId": "string",
  "readAt": "2026-10-27T12:00:00Z",
  "createdAt": "2026-10-27T12:00:00Z"
}
```

### `PATCH /mobile/core/notifications/read-all`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `PATCH /mobile/core/groups/{groupId}/members/{userId}/role`

**Request JSON**

```json
{
  "memberRole": "EDITOR"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `PATCH /mobile/core/commercial/groups/{groupId}/employees/{userId}/role`

**Request JSON**

```json
{
  "memberRole": "EDITOR"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "ownerId": "00000000-0000-4000-8000-000000000001",
  "ownerName": "string",
  "isOwner": true,
  "defaultConversationId": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "bannerPicture": "string",
  "timeZone": "string",
  "membersCount": 1,
  "members": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "isOwner": true,
      "joinedAt": "2026-10-27T12:00:00Z",
      "memberRole": "EDITOR"
    }
  ],
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `PATCH /mobile/core/advertisements/{id}/status`

**Request JSON**

```json
{
  "status": "DRAFT"
}
```

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "advertiserId": "00000000-0000-4000-8000-000000000001",
  "advertiserName": "string",
  "name": "string",
  "productName": "string",
  "category": "string",
  "description": "string",
  "imageUrl": "string",
  "destinationUrl": "string",
  "price": 1.0,
  "startDate": "2026-10-27",
  "endDate": "2026-10-27",
  "status": "DRAFT",
  "impressions": 1,
  "clicks": 1,
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/user`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "profilePictureUrl": "string",
      "email": "string",
      "accountType": "DOMESTIC",
      "birthDate": "2026-10-27"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/user/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `DELETE /mobile/core/user/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200` sem body.

### `GET /mobile/core/user/search`

Query: `email` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "string",
  "profilePictureUrl": "string",
  "email": "string",
  "accountType": "DOMESTIC",
  "birthDate": "2026-10-27"
}
```

### `GET /mobile/core/transactions`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "status": "PENDING",
      "amount": 1.0,
      "paymentMethod": "PIX",
      "idempotencyKey": "string",
      "planCode": "string",
      "errorMessage": "string",
      "createdAt": "2026-10-27T12:00:00Z",
      "queuedAt": "2026-10-27T12:00:00Z",
      "processedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/transactions/{transactionId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "status": "PENDING",
  "amount": 1.0,
  "paymentMethod": "PIX",
  "idempotencyKey": "string",
  "planCode": "string",
  "errorMessage": "string",
  "createdAt": "2026-10-27T12:00:00Z",
  "queuedAt": "2026-10-27T12:00:00Z",
  "processedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/subscriptions`

Query: `pageable` (obrigatório); `status` (opcional); `planId` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "userId": "00000000-0000-4000-8000-000000000001",
      "userEmail": "string",
      "userName": "string",
      "plan": {
        "id": 1,
        "planCode": "string",
        "name": "string",
        "description": "string",
        "price": 1.0,
        "billingInterval": "MONTHLY",
        "active": true,
        "limits": {
          "planCode": "FREE",
          "maxGroupsCreated": "...",
          "maxGroupMembers": "...",
          "maxStocks": "...",
          "maxProductsPerStock": "...",
          "allowOwnProducts": "...",
          "allowSavedRecipes": "...",
          "allowMoneySaving": "...",
          "costPerPublishedAd": "...",
          "hasMonthlyReport": "...",
          "enterprise": "..."
        },
        "createdAt": "2026-10-27T12:00:00Z",
        "updatedAt": "2026-10-27T12:00:00Z",
        "benefits": [
          "..."
        ]
      },
      "status": "TRIAL",
      "startedAt": "2026-10-27T12:00:00Z",
      "currentPeriodStart": "2026-10-27T12:00:00Z",
      "currentPeriodEnd": "2026-10-27T12:00:00Z",
      "canceledAt": "2026-10-27T12:00:00Z",
      "limits": {
        "planCode": "FREE",
        "maxGroupsCreated": 1,
        "maxGroupMembers": 1,
        "maxStocks": 1,
        "maxProductsPerStock": 1,
        "allowOwnProducts": true,
        "allowSavedRecipes": true,
        "allowMoneySaving": true,
        "costPerPublishedAd": 1.0,
        "hasMonthlyReport": true,
        "enterprise": true
      },
      "autoRenew": true
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/subscriptions/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `GET /mobile/core/subscriptions/user/{userId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `GET /mobile/core/subscriptions/me`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "userId": "00000000-0000-4000-8000-000000000001",
  "userEmail": "string",
  "userName": "string",
  "plan": {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  },
  "status": "TRIAL",
  "startedAt": "2026-10-27T12:00:00Z",
  "currentPeriodStart": "2026-10-27T12:00:00Z",
  "currentPeriodEnd": "2026-10-27T12:00:00Z",
  "canceledAt": "2026-10-27T12:00:00Z",
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "autoRenew": true
}
```

### `GET /mobile/core/stocks/my-summary`

Query: `groupId` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "groupId": "00000000-0000-4000-8000-000000000001",
  "stockCount": 1,
  "productCount": 1,
  "itemCount": 1,
  "estimatedValue": 1.0,
  "pendingShoppingItems": 1,
  "quantitiesByUnit": {},
  "itemsByStoragePlace": {},
  "consumedThisWeek": {},
  "weekStart": "2026-10-27",
  "nearExpiration": [
    {
      "id": 1,
      "productId": 1,
      "product": {
        "id": 1,
        "name": "string",
        "category": "FRUIT",
        "storagePlace": "FRIDGE",
        "unitPrice": 1.0,
        "unitOfMeasure": "KILOGRAM",
        "brand": "string",
        "imageUrl": "string"
      },
      "stockId": 1,
      "quantity": 1,
      "initialQuantity": 1,
      "minimalQuantity": 1,
      "purchaseUnitPrice": 1.0,
      "expireDate": "2026-10-27",
      "productStatus": "FRESH",
      "category": "FRUIT",
      "batch": "string"
    }
  ]
}
```

### `GET /mobile/core/stocks/active-context`

Query: `groupId` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "groupId": "00000000-0000-4000-8000-000000000001",
  "stocks": [
    {
      "id": 1,
      "groupId": "00000000-0000-4000-8000-000000000001",
      "name": "string"
    }
  ]
}
```

### `GET /mobile/core/shopping-lists/suggestions`

Suggest products that are below their minimum stock quantity

Query: `stockId` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "product": {
      "id": 1,
      "name": "string",
      "category": "FRUIT",
      "storagePlace": "FRIDGE",
      "unitPrice": 1.0,
      "unitOfMeasure": "KILOGRAM",
      "brand": "string",
      "imageUrl": "string",
      "createdAt": "2026-10-27T12:00:00Z",
      "ownerGroupId": "00000000-0000-4000-8000-000000000001"
    },
    "currentQuantity": 1,
    "suggestedQuantity": 1,
    "reason": "string"
  }
]
```

### `GET /mobile/core/recipes/{id}/availability`

Query: `stockId` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "productId": 1,
    "productName": "string",
    "requiredQuantity": 1.0,
    "availableQuantity": 1,
    "unit": "string",
    "required": true,
    "available": true
  }
]
```

### `GET /mobile/core/recipes/suggestions`

Query: `stockId` (opcional); `limit` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "recipe": {
      "id": 1,
      "name": "string",
      "description": "string",
      "instructions": "string",
      "domesticOnly": true,
      "active": true,
      "createdAt": "2026-10-27T12:00:00Z",
      "favorite": true,
      "ingredients": [
        {
          "id": "...",
          "recipeId": "...",
          "recipeName": "...",
          "productId": "...",
          "productName": "...",
          "productCategory": "FRUIT",
          "productUnitOfMeasure": "...",
          "quantity": "...",
          "unit": "...",
          "required": "...",
          "inStock": "...",
          "expireDate": "...",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    },
    "matchedIngredients": 1,
    "missingIngredients": 1,
    "score": 1.0,
    "availability": [
      {
        "productId": 1,
        "productName": "string",
        "requiredQuantity": 1.0,
        "availableQuantity": 1,
        "unit": "string",
        "required": true,
        "available": true
      }
    ]
  }
]
```

### `GET /mobile/core/recipes/favorites`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "instructions": "string",
      "domesticOnly": true,
      "active": true,
      "createdAt": "2026-10-27T12:00:00Z",
      "favorite": true,
      "ingredients": [
        {
          "id": "...",
          "recipeId": "...",
          "recipeName": "...",
          "productId": "...",
          "productName": "...",
          "productCategory": "FRUIT",
          "productUnitOfMeasure": "...",
          "quantity": "...",
          "unit": "...",
          "required": "...",
          "inStock": "...",
          "expireDate": "...",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/receipts/{receiptId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "receiptId": "00000000-0000-4000-8000-000000000001",
  "status": "string",
  "invoice": {
    "documentType": "string",
    "accessKey": "string",
    "issuerName": "string",
    "issuedAt": "2026-10-27T12:00:00Z",
    "totalAmount": 1.0
  },
  "items": [
    {
      "lineId": "00000000-0000-4000-8000-000000000001",
      "action": "string",
      "productId": 1,
      "quantity": 1,
      "expireDate": "2026-10-27"
    }
  ],
  "warnings": [
    "string"
  ]
}
```

### `GET /mobile/core/plans/{planCode}/limits`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "planCode": "FREE",
  "maxGroupsCreated": 1,
  "maxGroupMembers": 1,
  "maxStocks": 1,
  "maxProductsPerStock": 1,
  "allowOwnProducts": true,
  "allowSavedRecipes": true,
  "allowMoneySaving": true,
  "costPerPublishedAd": 1.0,
  "hasMonthlyReport": true,
  "enterprise": true
}
```

### `GET /mobile/core/plans/me/limits`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "planCode": "FREE",
  "maxGroupsCreated": 1,
  "maxGroupMembers": 1,
  "maxStocks": 1,
  "maxProductsPerStock": 1,
  "allowOwnProducts": true,
  "allowSavedRecipes": true,
  "allowMoneySaving": true,
  "costPerPublishedAd": 1.0,
  "hasMonthlyReport": true,
  "enterprise": true
}
```

### `GET /mobile/core/plans/code/{planCode}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "planCode": "string",
  "name": "string",
  "description": "string",
  "price": 1.0,
  "billingInterval": "MONTHLY",
  "active": true,
  "limits": {
    "planCode": "FREE",
    "maxGroupsCreated": 1,
    "maxGroupMembers": 1,
    "maxStocks": 1,
    "maxProductsPerStock": 1,
    "allowOwnProducts": true,
    "allowSavedRecipes": true,
    "allowMoneySaving": true,
    "costPerPublishedAd": 1.0,
    "hasMonthlyReport": true,
    "enterprise": true
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z",
  "benefits": [
    {
      "code": "string",
      "label": "string",
      "enabled": true,
      "limit": 1
    }
  ]
}
```

### `GET /mobile/core/plans/admin/all`

Query: `pageable` (obrigatório); `includeDeleted` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": 1,
      "planCode": "string",
      "name": "string",
      "description": "string",
      "price": 1.0,
      "billingInterval": "MONTHLY",
      "active": true,
      "limits": {
        "planCode": "FREE",
        "maxGroupsCreated": 1,
        "maxGroupMembers": 1,
        "maxStocks": 1,
        "maxProductsPerStock": 1,
        "allowOwnProducts": true,
        "allowSavedRecipes": true,
        "allowMoneySaving": true,
        "costPerPublishedAd": 1.0,
        "hasMonthlyReport": true,
        "enterprise": true
      },
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z",
      "benefits": [
        {
          "code": "...",
          "label": "...",
          "enabled": "...",
          "limit": "..."
        }
      ]
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/plans/active`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": 1,
    "planCode": "string",
    "name": "string",
    "description": "string",
    "price": 1.0,
    "billingInterval": "MONTHLY",
    "active": true,
    "limits": {
      "planCode": "FREE",
      "maxGroupsCreated": 1,
      "maxGroupMembers": 1,
      "maxStocks": 1,
      "maxProductsPerStock": 1,
      "allowOwnProducts": true,
      "allowSavedRecipes": true,
      "allowMoneySaving": true,
      "costPerPublishedAd": 1.0,
      "hasMonthlyReport": true,
      "enterprise": true
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "benefits": [
      {
        "code": "string",
        "label": "string",
        "enabled": true,
        "limit": 1
      }
    ]
  }
]
```

### `GET /mobile/core/notifications`

Listar minhas notificações

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "groupId": "00000000-0000-4000-8000-000000000001",
      "type": "PRODUCT_NEAR_EXPIRATION",
      "title": "string",
      "body": "string",
      "referenceId": "string",
      "readAt": "2026-10-27T12:00:00Z",
      "createdAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `DELETE /mobile/core/notifications`

Limpar todas as notificações do usuário autenticado

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `GET /mobile/core/notifications/unread`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "groupId": "00000000-0000-4000-8000-000000000001",
      "type": "PRODUCT_NEAR_EXPIRATION",
      "title": "string",
      "body": "string",
      "referenceId": "string",
      "readAt": "2026-10-27T12:00:00Z",
      "createdAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/notifications/unread-count`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{}
```

### `GET /mobile/core/ingredients/recipe/{recipeId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": 1,
    "recipeId": 1,
    "recipeName": "string",
    "productId": 1,
    "productName": "string",
    "productCategory": "FRUIT",
    "productUnitOfMeasure": "string",
    "quantity": 1.0,
    "unit": "string",
    "required": true,
    "inStock": true,
    "expireDate": "2026-10-27",
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z"
  }
]
```

### `GET /mobile/core/ingredients/product/{productId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": 1,
    "recipeId": 1,
    "recipeName": "string",
    "productId": 1,
    "productName": "string",
    "productCategory": "FRUIT",
    "productUnitOfMeasure": "string",
    "quantity": 1.0,
    "unit": "string",
    "required": true,
    "inStock": true,
    "expireDate": "2026-10-27",
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z"
  }
]
```

### `GET /mobile/core/groups/{groupId}/money-saving/summary`

Query: `from` (obrigatório); `to` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "spending": {
    "amount": 1.0,
    "actions": 1
  },
  "saving": {
    "amount": 1.0,
    "actions": 1
  },
  "loss": {
    "amount": 1.0,
    "actions": 1
  },
  "previousSpending": 1.0,
  "spendingChangePercent": 1.0,
  "hasFinancialData": true,
  "categories": [
    {
      "category": "string",
      "spent": 1.0,
      "saved": 1.0,
      "lost": 1.0
    }
  ],
  "months": [
    {
      "month": "string",
      "spent": 1.0,
      "saved": 1.0,
      "lost": 1.0
    }
  ]
}
```

### `GET /mobile/core/groups/{groupId}/money-saving/events`

Query: `from` (obrigatório); `to` (obrigatório); `category` (opcional); `kind` (opcional); `page` (opcional); `size` (opcional).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "content": [
    {
      "id": "string",
      "kind": "string",
      "date": "2026-10-27",
      "productName": "string",
      "category": "string",
      "categoryGroup": "string",
      "unitOfMeasure": "string",
      "quantity": 1,
      "amount": 1.0,
      "verifiedValue": true,
      "includedInMetric": true,
      "reasonCode": "string",
      "categoryAmounts": [
        {
          "category": "...",
          "amount": "..."
        }
      ]
    }
  ],
  "totalElements": 1,
  "number": 1,
  "size": 1,
  "totalPages": 1
}
```

### `GET /mobile/core/groups/page`

Listar grupos do usuário de forma paginada

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "ownerId": "00000000-0000-4000-8000-000000000001",
      "ownerName": "string",
      "isOwner": true,
      "defaultConversationId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "bannerPicture": "string",
      "timeZone": "string",
      "membersCount": 1,
      "members": [
        {
          "userId": "...",
          "name": "...",
          "email": "...",
          "isOwner": "...",
          "joinedAt": "...",
          "memberRole": "EDITOR"
        }
      ],
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/discard/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": 1,
  "stockProductId": 1,
  "reason": "string",
  "reasonCode": "string",
  "canceledAt": "2026-10-27T12:00:00Z",
  "date": "2026-10-27T12:00:00Z",
  "quantity": 1
}
```

### `DELETE /mobile/core/discard/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200` sem body.

### `GET /mobile/core/conversations`

Listar conversas ativas do usuário autenticado

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "id": "00000000-0000-4000-8000-000000000001",
    "conversationType": "PRIVATE",
    "groupId": "00000000-0000-4000-8000-000000000001",
    "groupName": "string",
    "name": "string",
    "pairKey": "string",
    "participants": [
      {
        "userId": "00000000-0000-4000-8000-000000000001",
        "name": "string",
        "email": "string",
        "joinedAt": "2026-10-27T12:00:00Z",
        "leftAt": "2026-10-27T12:00:00Z"
      }
    ],
    "latestMessage": {
      "id": 1,
      "conversationId": "00000000-0000-4000-8000-000000000001",
      "senderId": "00000000-0000-4000-8000-000000000001",
      "senderName": "string",
      "messageType": "TEXT",
      "content": "string",
      "relatedShoppingListProductId": 1,
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z",
      "attachments": [
        {
          "id": "...",
          "fileUrl": "...",
          "fileName": "...",
          "mimeType": "...",
          "fileSize": "...",
          "createdAt": "..."
        }
      ]
    },
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z"
  }
]
```

### `GET /mobile/core/conversations/{id}`

Obter detalhes de uma conversa por ID

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "conversationType": "PRIVATE",
  "groupId": "00000000-0000-4000-8000-000000000001",
  "groupName": "string",
  "name": "string",
  "pairKey": "string",
  "participants": [
    {
      "userId": "00000000-0000-4000-8000-000000000001",
      "name": "string",
      "email": "string",
      "joinedAt": "2026-10-27T12:00:00Z",
      "leftAt": "2026-10-27T12:00:00Z"
    }
  ],
  "latestMessage": {
    "id": 1,
    "conversationId": "00000000-0000-4000-8000-000000000001",
    "senderId": "00000000-0000-4000-8000-000000000001",
    "senderName": "string",
    "messageType": "TEXT",
    "content": "string",
    "relatedShoppingListProductId": 1,
    "createdAt": "2026-10-27T12:00:00Z",
    "updatedAt": "2026-10-27T12:00:00Z",
    "attachments": [
      {
        "id": 1,
        "fileUrl": "string",
        "fileName": "string",
        "mimeType": "string",
        "fileSize": 1,
        "createdAt": "2026-10-27T12:00:00Z"
      }
    ]
  },
  "createdAt": "2026-10-27T12:00:00Z",
  "updatedAt": "2026-10-27T12:00:00Z"
}
```

### `GET /mobile/core/commercial/groups/{groupId}/reports/monthly`

Query: `month` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "groupId": "00000000-0000-4000-8000-000000000001",
  "month": "string",
  "totalExpenses": 1.0,
  "purchaseTotal": 1.0,
  "completedPurchases": 1,
  "expensesByCategory": {}
}
```

### `GET /mobile/core/commercial/groups/{groupId}/reports/monthly/export`

Query: `month` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
"string"
```

### `GET /mobile/core/commercial/groups/{groupId}/employees`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "userId": "00000000-0000-4000-8000-000000000001",
    "name": "string",
    "email": "string",
    "isOwner": true,
    "joinedAt": "2026-10-27T12:00:00Z",
    "memberRole": "EDITOR"
  }
]
```

### `GET /mobile/core/auth/csrf`

Query: `token` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{}
```

### `GET /mobile/core/ai/recipes/suggestions/stock/{stockId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
[
  {
    "sessionId": "string",
    "chatMessage": "string",
    "recipeId": 1,
    "recipeName": "string",
    "recipeDescription": "string",
    "recipeInstructions": "string",
    "ingredients": [
      {
        "id": 1,
        "recipeId": 1,
        "recipeName": "string",
        "productId": 1,
        "productName": "string",
        "productCategory": "FRUIT",
        "productUnitOfMeasure": "string",
        "quantity": 1.0,
        "unit": "string",
        "required": true,
        "inStock": true,
        "expireDate": "2026-10-27",
        "createdAt": "2026-10-27T12:00:00Z",
        "updatedAt": "2026-10-27T12:00:00Z"
      }
    ],
    "suggestionId": 1,
    "matchedIngredients": 1,
    "missingIngredients": 1,
    "score": 1.0,
    "nearestExpireDate": "2026-10-27"
  }
]
```

### `GET /mobile/core/advertisements/mine`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "advertiserId": "00000000-0000-4000-8000-000000000001",
      "advertiserName": "string",
      "name": "string",
      "productName": "string",
      "category": "string",
      "description": "string",
      "imageUrl": "string",
      "destinationUrl": "string",
      "price": 1.0,
      "startDate": "2026-10-27",
      "endDate": "2026-10-27",
      "status": "DRAFT",
      "impressions": 1,
      "clicks": 1,
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `GET /mobile/core/advertisements/active`

Query: `pageable` (obrigatório).

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `200`

```json
{
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "size": 1,
  "content": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "advertiserId": "00000000-0000-4000-8000-000000000001",
      "advertiserName": "string",
      "name": "string",
      "productName": "string",
      "category": "string",
      "description": "string",
      "imageUrl": "string",
      "destinationUrl": "string",
      "price": 1.0,
      "startDate": "2026-10-27",
      "endDate": "2026-10-27",
      "status": "DRAFT",
      "impressions": 1,
      "clicks": 1,
      "createdAt": "2026-10-27T12:00:00Z",
      "updatedAt": "2026-10-27T12:00:00Z"
    }
  ],
  "number": 1,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1,
  "pageable": {
    "offset": 1,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1,
    "pageSize": 1,
    "unpaged": true
  },
  "last": true,
  "empty": true
}
```

### `DELETE /mobile/core/groups/{id}/members/{userId}`

Remover membro do grupo ou sair do grupo

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `DELETE /mobile/core/groups/{id}/leave`

Sair do grupo atual (repassa admin caso seja o proprietário ou encerra o grupo se for o último)

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `DELETE /mobile/core/groups/{groupId}/invitations/{id}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `DELETE /mobile/core/conversations/{id}/leave`

Sair de uma conversa

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

### `DELETE /mobile/core/commercial/groups/{groupId}/employees/{userId}`

**Request JSON**

Sem body JSON.

**Response de sucesso**

HTTP `204` sem body.

## Endpoints agregados mobile

Estas rotas adaptam ou agregam dados para telas mobile. As outras operações do Core podem ser acessadas pelo proxy `/mobile/core`.

| Método e rota | Request / query | Response de sucesso |
|---|---|---|
| `GET /mobile/inventory/home` | `groupId` opcional (UUID) | `{ "groupId": "<uuid>", "stocks": [], "summary": {}, "categoryCounts": {}, "statusCounts": {}, "nearExpiration": [] }` |
| `GET /mobile/inventory/stocks/{stockId}/products` | `page`, `size`, `category`, `storagePlace`, `q` | Página Core `Page<StockProductResponseDto>` |
| `GET /mobile/inventory/products` | `page`, `size`, `category`, `storagePlace`, `q`, `groupId` | Página filtrada de produtos do contexto ativo |
| `GET /mobile/inventory/stock-products/{id}` | — | `StockProductResponseDto` |
| `PUT /mobile/inventory/stock-products/{id}` | JSON de atualização abaixo | `StockProductResponseDto` |
| `DELETE /mobile/inventory/stock-products/{id}` | — | HTTP `204`, sem body |
| `GET /mobile/inventory/stock-products/{id}/movements` | `page`, `size` | Página `Page<StockMovementResponseDto>` |
| `POST /mobile/inventory/stock-products/{id}/movements` | JSON de movimento abaixo | `StockMovementResponseDto` (HTTP `201`) |
| `POST /mobile/inventory/receipts/scan` | JSON abaixo | `ReceiptResponseDto` (HTTP `201`) |
| `GET /mobile/inventory/receipts/{receiptId}` | — | `ReceiptResponseDto` |
| `POST /mobile/inventory/receipts/{receiptId}/confirm` | JSON abaixo | resumo de itens importados/ignorados |
| `GET /mobile/advertisements/active` | `page`, `size` | Página `Page<AdvertisementResponseDto>` |
| `POST /mobile/advertisements/{id}/impressions` | — | HTTP `204`, sem body |
| `POST /mobile/advertisements/{id}/clicks` | — | HTTP `204`, sem body |
| `GET /mobile/notifications` | `page`, `size`, `unreadOnly` | Página de notificações mais `unreadCount` |
| `PATCH /mobile/notifications/{id}/read` | — | `NotificationResponseDto` |
| `PATCH /mobile/notifications/read-all` | — | HTTP `204`, sem body |
| `DELETE /mobile/notifications` | — | HTTP `204`, sem body |
| `GET /mobile/recipes` | `page`, `size`, `q` | Página de receitas |
| `GET /mobile/recipes/favorites` | `page`, `size` | Página de receitas favoritas |
| `GET /mobile/recipes/suggestions` | `stockId`, `limit` | Lista de sugestões |
| `GET /mobile/recipes/ai/suggestions/{stockId}` | — | Lista de sugestões da IA |
| `POST /mobile/recipes/ai/chat` | JSON abaixo | resposta da conversa de IA |
| `PUT /mobile/recipes/{id}/favorite` | — | HTTP `204`, sem body |
| `DELETE /mobile/recipes/{id}/favorite` | — | HTTP `204`, sem body |
| `GET /mobile/recipes/{id}` | `stockId` opcional | receita; inclui `availability` quando `stockId` é enviado |

### JSON mobile: atualização de item do estoque

```json
{
  "quantity": 4,
  "minimalQuantity": 1,
  "expireDate": "2026-11-30",
  "storagePlace": "FRIDGE"
}
```

### JSON mobile: movimento de estoque

```json
{
  "movementType": "IN",
  "quantity": 2,
  "observation": "Reposição"
}
```

### JSON mobile: leitura de nota fiscal

```json
{
  "stockId": 1,
  "qrPayload": "https://www.fazenda.sp.gov.br/nfce/qrcode?p=..."
}
```

### JSON mobile: confirmação de itens da nota

```json
{
  "items": [
    {
      "lineId": "00000000-0000-4000-8000-000000000001",
      "action": "IMPORT",
      "productId": 1,
      "quantity": 2,
      "expireDate": "2026-11-30"
    },
    {
      "lineId": "00000000-0000-4000-8000-000000000002",
      "action": "IGNORE"
    }
  ]
}
```

### JSON mobile: chat de receitas com IA

```json
{
  "message": "O que posso cozinhar com esses ingredientes?",
  "stockId": 1,
  "sessionId": "sessao-mobile-1"
}
```

### Exemplo de resposta paginada

```json
{
  "content": [
    {
      "id": 1,
      "name": "Leite",
      "quantity": 2
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```
