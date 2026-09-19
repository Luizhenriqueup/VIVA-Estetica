# Viva Estética — Back-End (esqueleto)

Express 5 + CommonJS. É **carcaça**: tudo roda de ponta a ponta, mas a persistência é em
memória (`src/data/db.js`) e os pontos que dependem de decisão estão marcados com `TODO`.

## Rodar

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:3333/api
```

Usuário do seed: `admin` / `admin123` — cai no fluxo de login temporário.

## Estrutura

```
src/
  config/env.js            variáveis de ambiente
  constants/roles.js       FUNCIONARIO | GERENTE | ADMINISTRADOR (oculto)
  constants/flags.js       bitmask de permissões + preset de flags por papel
  utils/flags.js           hasAll / hasAny / add / remove / toNames / filterByFlags
  middlewares/             auth, permission (requireFlags/requireRole), validate, error
  data/db.js               repositórios em memória — trocar por Prisma/Mongo só aqui
  data/seed.js             admin inicial + 1 POP + 1 módulo educativo
  modules/
    auth/        login temporário, setup de credenciais, JWT, bcrypt
    panel/       HUD: actions filtradas por flag + swap de tipo de conta
    reports/     catálogo de perguntas + scoring (crítico por segurança)
    alerts/      alertas manuais e automáticos (relatório crítico)
    pops/        cards + download do PDF em /storage/pops
    education/   itens do YouTube (embedUrl/thumbnail prontos pro iframe)
    admin/       gerar login, promover, flags avulsas, desativar, reset
  routes/index.js          monta tudo em /api
```

## Rotas

| Método | Rota | Flag exigida |
|---|---|---|
| POST | /api/auth/login | pública |
| POST | /api/auth/setup-credentials | token com scope `setup` |
| GET | /api/auth/me | autenticado |
| POST | /api/auth/change-password | autenticado |
| GET | /api/panel | PANEL_ACCESS |
| GET | /api/panel/roles | PANEL_ACCESS |
| POST | /api/panel/switch-role | PANEL_ACCESS |
| GET | /api/reports/questions | REPORT_CREATE |
| POST | /api/reports | REPORT_CREATE |
| GET | /api/reports | REPORT_VIEW_OWN ou REPORT_VIEW_ALL |
| GET | /api/reports/export | REPORT_EXPORT |
| GET / DELETE | /api/reports/:id | view / REPORT_DELETE |
| GET / POST | /api/alerts | ALERT_VIEW / ALERT_CREATE |
| PATCH | /api/alerts/:id/ack, /resolve | ALERT_ACK / ALERT_RESOLVE |
| GET | /api/pops | POP_VIEW |
| GET | /api/pops/:id/download | POP_DOWNLOAD |
| POST | /api/pops | POP_MANAGE |
| GET | /api/education | EDU_VIEW |
| POST | /api/education | EDU_MANAGE |
| GET / POST | /api/admin/users | ADMIN_USER_VIEW / ADMIN_USER_CREATE |
| PATCH | /api/admin/users/:id/promote | ADMIN_USER_PROMOTE |
| PATCH | /api/admin/users/:id/flags | ADMIN_FLAGS_EDIT |
| PATCH | /api/admin/users/:id/status | ADMIN_USER_DISABLE |
| POST | /api/admin/users/:id/reset | ADMIN_USER_CREATE |

Resposta padrão: `{ success, data }` ou `{ success: false, error: { message, details } }`.

## Como o front consome as flags

`GET /api/panel` devolve as `actions` **já filtradas** pelas flags do usuário, mais
`flagNames` para casos pontuais. O painel só renderiza o que vier — sem espalhar
`if (role === 'GERENTE')` pelo React.

## Fluxo do login temporário

1. Admin/gerente chama `POST /api/admin/users` — a resposta traz `temporaryCredentials`
   (mostrar uma única vez na tela).
2. O usuário faz `POST /api/auth/login` com elas e recebe um token com `scope: "setup"`
   e `mustChangeCredentials: true`.
3. Qualquer outra rota responde 403 com `code: "SETUP_REQUIRED"`.
4. `POST /api/auth/setup-credentials` com `{ username, newPassword }` devolve o token normal.

## Regra de prioridade do relatório

Em `modules/reports/reports.scoring.js`: se qualquer pergunta de `SEGURANCA` marcada como
`critical` vier diferente de `ADEQUADO`, o relatório inteiro vira `CRITICO` (ignora o score)
e dispara alerta automático. Caso contrário: score abaixo de 60 = ALTO, abaixo de 85 = MEDIO,
resto BAIXO. As faixas e as perguntas são placeholders.

## TODOs principais

- Banco real (só `src/data/db.js` muda)
- Schemas zod em `*.schema.js` ligados ao `validate.middleware.js`
- Upload dos PDFs dos POPs (multer) e conteúdo real das perguntas/módulos
- Envio da notificação do alerta em `alerts.service.notify`
- Export CSV/XLSX de verdade em `reports.service.exportAll`
- Hash da senha temporária (hoje é texto puro) e checagem de `tempExpiresAt`
