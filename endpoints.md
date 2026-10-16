# API do Viva Estética

## Visão geral

A API é servida na raiz do backend (por exemplo, `http://localhost:3000`). Os endpoints abaixo usam JSON, salvo quando a resposta é `204 No Content`.

Endpoints protegidos exigem o cabeçalho:

```http
Authorization: Bearer <token>
```

O token é obtido em `POST /auth/login`. Contas temporárias não podem consultar alertas nem criar, consultar ou excluir relatórios. A autorização por perfil usa `Admin`, `Gerente` e `Funcionario`.

## Formato das respostas do questionário

`questionnaire` é um array JSON de inteiros não negativos, armazenado no banco em uma coluna PostgreSQL `JSONB`. A posição no array identifica a pergunta, em ordem, e o valor é o índice, começando em zero, da única alternativa escolhida naquela pergunta. Por exemplo:

```json
[2, 0, 1]
```

Isso representa a terceira alternativa da primeira pergunta, a primeira alternativa da segunda pergunta e a segunda alternativa da terceira pergunta. O array pode estar vazio; quando houver respostas, cada item deve ser um inteiro não negativo seguro. Valores fracionários, negativos, texto, `null` e arrays com itens inválidos são rejeitados. O backend não recebe nem valida a quantidade de perguntas ou alternativas: ela depende do questionário apresentado pelo cliente.

## Autenticação — `/auth`

| Método e caminho | O que faz | Autenticação e permissões |
|---|---|---|
| `POST /auth/login` | Autentica usuário e senha e cria um token com validade de 12 horas. | Público |
| `POST /auth/register/tempLogin` | Cria uma conta temporária e retorna as credenciais para ela. | Token; `Admin` ou `Gerente`; conta temporária não autorizada |
| `POST /auth/register` | Ativa a conta temporária autenticada, definindo usuário e senha permanentes. Tokens existentes dessa conta são revogados. | Token da conta temporária a ativar |
| `POST /auth/logout` | Encerra a sessão do token enviado. | Token |
| `PUT /auth/flags` | Define as permissões de uma conta permanente. | Token; `Admin` |
| `DELETE /auth/:id` | Exclui a conta autenticada. | Token; só permite excluir o próprio `userId` |

### `POST /auth/login`

Requisição:

```json
{ "username": "ana", "password": "senha-segura" }
```

Resposta `200`:

```json
{
  "userId": "cm...",
  "token": "token-de-sessao",
  "expiresAt": "2026-10-16T12:00:00.000Z"
}
```

Erros: `400` se usuário ou senha estiver ausente/vazio; `401` se as credenciais forem inválidas.

### `POST /auth/register/tempLogin`

Requisição: sem corpo.

Resposta `201`:

```json
{ "userId": "cm...", "username": "12345678", "password": "senha-gerada" }
```

Erro: `403` para falta de permissão ou conta temporária.

### `POST /auth/register`

Exemplo, enviado com o token da conta temporária:

```json
{ "username": "ana", "password": "senha-com-8-ou-mais-caracteres" }
```

Resposta `200`:

```json
{ "userId": "cm...", "username": "ana", "isTemp": false }
```

Erros: `400` para campos inválidos ou senha com menos de 8 caracteres; `401` para token ausente/inválido; `409` se a conta já tiver sido ativada.

### `POST /auth/logout`

Sem corpo. Resposta `204` sem conteúdo. Erros: `401` para token ausente, inválido ou expirado.

### `PUT /auth/flags`

Exemplo:

```json
{ "userId": "cm...", "flags": ["Funcionario"] }
```

As flags válidas são `Admin`, `Gerente` e `Funcionario`; duplicatas não são permitidas. Resposta `200`:

```json
{
  "userId": "cm...",
  "username": "ana",
  "isTemp": false,
  "flags": ["Funcionario"]
}
```

Erros: `400` para campos/flags inválidos; `401` para autenticação inválida; `403` sem permissão de `Admin`; `404` se o usuário não existir; `409` para conta temporária, tentativa de remover o último `Admin` ou conflito de atualização.

### `DELETE /auth/:id`

Exemplo: `DELETE /auth/cm...`, usando o próprio token. Resposta `204` sem conteúdo. Erros: `401` para token inválido; `403` se `:id` não corresponder à conta autenticada; `404` se a conta não existir.

## Relatórios — `/reports`

Todos os endpoints exigem um token de conta permanente com pelo menos uma das flags `Admin`, `Gerente` ou `Funcionario`. Cada relatório é associado exclusivamente ao usuário autenticado. Um `userId` enviado pelo cliente não define nem altera o proprietário.

| Método e caminho | O que faz |
|---|---|
| `POST /reports` | Cria um relatório para o usuário autenticado com nome e respostas do questionário. |
| `GET /reports` | Lista somente os relatórios do usuário autenticado. |
| `GET /reports/:id` | Consulta um relatório pertencente ao usuário autenticado. |
| `DELETE /reports/:id` | Exclui um relatório pertencente ao usuário autenticado. |

### `POST /reports`

Requisição:

```json
{ "nome": "Avaliação inicial", "questionnaire": [2, 0, 1] }
```

Resposta `201`:

```json
{
  "id": "cm...",
  "userId": "cm...",
  "nome": "Avaliação inicial",
  "questionnaire": [2, 0, 1]
}
```

Erros: `400` se `nome` estiver ausente, vazio ou não for uma string, ou se `questionnaire` estiver ausente ou não for um array de inteiros não negativos; `401` para autenticação inválida/ausente; `403` para conta temporária ou usuário sem flag autorizada.

### `GET /reports`

Resposta `200`:

```json
[
  {
    "id": "cm...",
    "userId": "cm...",
    "nome": "Avaliação inicial",
    "questionnaire": [2, 0, 1]
  }
]
```

Relatórios existentes são preservados e retornam `nome: ""` caso tenham sido criados antes da inclusão desse campo. Erros: `401` para autenticação inválida/ausente; `403` para conta temporária ou usuário sem flag autorizada.

### `GET /reports/:id`

Resposta `200` tem o mesmo formato de um objeto da lista. O endpoint retorna `404` se o relatório não existir ou pertencer a outro usuário. Também pode retornar `401` ou `403` pelos motivos descritos acima.

### `DELETE /reports/:id`

Resposta `204` sem conteúdo. Retorna `404` se o relatório não existir ou pertencer a outro usuário; também pode retornar `401` ou `403`.

## Alertas — `/alerts`

Todos os endpoints exigem autenticação por token de uma conta permanente. A leitura exige uma das flags `Admin`, `Gerente` ou `Funcionario`; criação, atualização e exclusão exigem `Admin` ou `Gerente`.

| Método e caminho | O que faz | Permissão |
|---|---|---|
| `GET /alerts` | Lista alertas do mais recente para o mais antigo. | Qualquer flag válida |
| `GET /alerts/:id` | Consulta um alerta. | Qualquer flag válida |
| `POST /alerts` | Cria um alerta. | `Admin` ou `Gerente` |
| `PUT /alerts/:id` | Atualiza parcialmente um alerta. | `Admin` ou `Gerente` |
| `DELETE /alerts/:id` | Exclui um alerta. | `Admin` ou `Gerente` |

Formato de alerta:

```json
{
  "id": "cm...",
  "title": "Aviso",
  "message": "Mensagem opcional",
  "createdAt": "2026-10-16T00:00:00.000Z",
  "updatedAt": "2026-10-16T00:00:00.000Z"
}
```

`POST /alerts` requer `title` não vazio e aceita `message` como texto, `null` ou ausente. Exemplo:

```json
{ "title": "Aviso", "message": "Informação importante." }
```

Resposta: `201` com o alerta criado. Erros: `400` para campos inválidos; `401` para autenticação inválida/ausente; `403` para conta temporária ou falta de permissão.

`PUT /alerts/:id` aceita `title`, `message` ou ambos; `title` deve ser texto não vazio, e `message` texto ou `null`. Exemplo:

```json
{ "message": "Mensagem atualizada." }
```

Resposta: `200` com o alerta atualizado. Erros: `400` se não houver campo para atualizar ou se um campo for inválido; `401` para autenticação inválida/ausente; `403` sem permissão; `404` se o alerta não existir.

`DELETE /alerts/:id` retorna `200` com o alerta excluído. Erros: `401` para autenticação inválida/ausente; `403` sem permissão; `404` se o alerta não existir.

As consultas de alertas retornam `200` com uma lista (GET `/alerts`) ou um alerta (GET `/alerts/:id`); alerta inexistente retorna `404`.

## Erros comuns

Os erros são objetos JSON no formato `{ "message": "..." }`, exceto as respostas `204`, que não têm corpo.

| Status | Significado típico |
|---|---|
| `400` | Corpo ausente/malformado para a operação, ou dados inválidos. |
| `401` | Token Bearer ausente, inválido ou expirado. |
| `403` | Conta temporária ou permissão insuficiente. |
| `404` | Registro inexistente ou não acessível para o usuário autenticado. |
| `409` | Conflito de unicidade, conta já ativada, regra de permissões ou relação. |
| `500` | Erro interno não tratado pela API. |
