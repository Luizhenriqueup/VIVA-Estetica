# Relatório de integração — Viva Estética Segura

Data: 6 de outubro de 2026.

## Resultado e limites da validação

O frontend foi adaptado aos contratos encontrados no backend, preservando React, React Router, Bootstrap, os logotipos, a paleta verde e os cards existentes. Não foram adicionadas dependências de produção.

**O backend não foi alterado.** Foram lidos todos os arquivos de código das duas pastas src, além de server.js, schema.prisma e configurações relevantes. O repositório estava sem alterações antes do trabalho. A conferência final por SHA-256 está registrada em verificacao-backend.json, ao lado deste relatório.

“Implementado” abaixo descreve código funcional no frontend e comunicação conforme os contratos verificados. A integração com servidor e banco reais **não foi validada de ponta a ponta**: não havia processo escutando na porta padrão 3000, não foram fornecidas credenciais de teste e não foi encontrado src/generated/prisma/client.js, importado pelo backend. Não gerei Prisma, não alterei banco, não inicializei administrador e não modifiquei configuração do backend.

## A. Alterações realizadas

- Login real por usuário e senha, no lugar de email/senha e console.log de credenciais.
- Remoção do atalho que permitia pular o login e do cadastro público fictício.
- Serviço único de API com Bearer, mensagens do servidor, tratamento de rede, timeout de 20 segundos, JSON inesperado, 401, 403 e respostas 204.
- Persistência em sessionStorage de apenas userId, token e expiresAt. A senha não é armazenada. A sessão persiste ao recarregar a aba; a validade é a devolvida pelo backend.
- Limpeza de sessão inválida/corrompida, expiração por timer/foco e por resposta 401. Logout chama o backend e limpa o navegador; se a revogação remota falhar, isso é informado.
- Rotas protegidas por autenticação e retorno à página originalmente solicitada.
- Remoção do usuário “Vanesa” e dos perfis mockados. O seletor agora apenas exibe perfis confirmados quando houver um contrato que os forneça; atualmente mostra “Não informado pelo sistema”.
- Painel com contagens reais de registros do usuário e alertas. Checklists concluídos e alto risco aparecem como indisponíveis, sem zero fictício.
- Relatórios com seleção de checklist ou alerta. Checklist possui estrutura inicial e nome do cliente, mas não envia nem persiste dados que o backend descartaria.
- Criação de alerta por title/message, validação, bloqueio de envio duplicado, loading, sucesso e erros; listagem recarregada após publicação.
- Alertas listados e abertos pelo endpoint de detalhe. Nenhuma marcação de leitura é simulada.
- Checklists feitos mostra os registros de relatório realmente retornados, sem inventar cliente, data, status ou PDF.
- POPs e conteúdo educativo com componentes de catálogo, estados vazios, links de documentos e thumbnails/abertura do YouTube preparados para materiais futuros.
- Layout compartilhado, sidebar com rotas reais, menu móvel Bootstrap Offcanvas, backdrop, Escape, gerenciamento de foco do componente Bootstrap, link para pular ao conteúdo e foco no conteúdo após navegação.
- Preservação da identidade visual e correção da precedência entre Bootstrap e CSS personalizado, confirmada por revisão visual.
- Tela de ativação de conta temporária pelo endpoint já existente; após ativar, limpa a sessão porque o backend revoga os tokens.
- Proxy Vite configurável; título e idioma do HTML corrigidos.
- Testes de contrato/sessão e roteiro automatizado de navegador fornecidos.

## B. Arquivos modificados ou criados

Caminhos relativos a Front-End/meu-app. Arquivos não listados permaneceram iguais.

| Arquivo | Alteração, motivo e funcionalidade |
| --- | --- |
| .env.example | Novo exemplo de configuração pública da API e destino do proxy, sem segredos. |
| index.html | Idioma pt-BR, título do sistema e cor do tema; remove referência ao favicon do template. |
| package.json | Scripts de testes de contrato e lint limitado aos fontes/testes/configuração, evitando analisar dependências. |
| vite.config.js | Proxy para /auth, /reports e /alerts; usa API_PROXY_TARGET ou localhost:3000. |
| src/App.jsx | Todas as páginas, AuthProvider, rotas protegidas e página não encontrada. |
| src/main.jsx | Remove imports ociosos e bundle Bootstrap duplicado; carrega Bootstrap antes dos estilos da aplicação. |
| src/components/Login/LoginForm.jsx | Corrige import com diferença de maiúsculas/minúsculas; envia username/password, valida e bloqueia formulário durante login. |
| src/components/ProtectedRoute.jsx | Novo guard de sessão e preservação do destino de navegação. |
| src/components/Painel/Layout.jsx | Novo layout compartilhado, cabeçalho, navegação móvel e logout. |
| src/components/Painel/Sidebar.jsx | Links reais para seis áreas, logout e ativação; elimina links aninhados e alt incorreto. |
| src/components/Painel/SeletorPerfil.jsx | Remove troca fictícia de autorização; permite apenas exibição de flags conhecidas. |
| src/components/Feedback.jsx | Loading, erro com retry, estado vazio e título compartilhados. |
| src/components/Biblioteca.jsx | Cards reutilizáveis de documentos/vídeos com validação de URLs e IDs do YouTube. |
| src/constants/perfis.js | Alinha identificadores à grafia exata Admin/Gerente/Funcionario. Não atribui perfis a usuários. |
| src/contexts/AuthContext.jsx | Provider de sessão, login/logout/expiração e serviço de API. |
| src/contexts/auth.js | Contexto e hook separados para reutilização e Fast Refresh. |
| src/data/materiais.js | Catálogos locais vazios com formato de apresentação documentado; não são contratos de API. |
| src/hooks/useResource.js | Carregamento, erro, retry e cancelamento de leituras ao sair da tela. |
| src/pages/Login.jsx | Integra autenticação e feedback; mantém identidade visual e orienta sobre acesso temporário. |
| src/pages/Painel.jsx | Substitui mock por métricas reais e indisponibilidade explícita das métricas ausentes. |
| src/pages/Relatorios.jsx | Estrutura de checklist e formulário integrado de alerta. |
| src/pages/Checklists.jsx | Tabela responsiva dos registros do usuário; campos ausentes e PDF indisponível. |
| src/pages/Alertas.jsx | Listagem, datas, mensagens, refresh e confirmação de criação. |
| src/pages/AlertaDetalhe.jsx | Leitura individual do alerta e descrição preservando quebras de linha. |
| src/pages/AtivarConta.jsx | Ativação pelo contrato existente e exigência de novo login. |
| src/pages/POPs.jsx | Biblioteca de PDFs com estado vazio. |
| src/pages/Conteudo.jsx | Biblioteca de vídeos com estado vazio. |
| src/services/api.js | Cliente centralizado com endpoints existentes e tratamento de falhas. |
| src/services/session.js | Validação e armazenamento mínimo de sessão. |
| src/styles/Painel.css | Complementa estilos existentes para layout, offcanvas, cards, tabela e acessibilidade. |
| src/utils/formatDate.js | Formatação pt-BR com fallback para datas indisponíveis. |
| tests/api.test.js | Dez testes executados de contrato, sessão e erros. |
| tests/browser-check.mjs | Roteiro de navegador com fixtures interceptadas; execução automatizada completa pendente pelo bloqueio de lançamento do navegador no ambiente. |
| INTEGRACAO.md | Este relatório técnico, também entregue separadamente. |

InputField, Login.css, imagens, App.css e index.css originais foram preservados. Os CSS residuais do template não foram importados. package-lock.json não mudou: nenhum pacote foi adicionado.

## C. Contratos integrados

As rotas são montadas em Back-End/server.js. Todas as chamadas autenticadas enviam Authorization: Bearer <token>. Corpos JSON usam Content-Type: application/json; respostas são solicitadas como JSON. O token é uma string opaca aleatória, **não JWT**, armazenada no backend como hash SHA-256, com validade de 12 horas estabelecida pelo servidor.

| Endpoint | Método | Finalidade e dados enviados | Resposta interpretada |
| --- | --- | --- | --- |
| /auth/login | POST | { username, password }. Username aparado; senha preservada. Sem Bearer. | { userId, token, expiresAt }. 400 campos inválidos; 401 credenciais inválidas. |
| /auth/logout | POST | Sem body; Bearer atual. | 204 sem conteúdo; 401 se token inválido/encerrado. |
| /auth/register | POST | { username, password }, Bearer da conta temporária. Senha com pelo menos 8 caracteres. | { userId, username, isTemp }. 409 se já ativada. Revoga os tokens no backend. |
| /reports | GET | Sem body; Bearer. | Array de { id, userId }, filtrado pelo usuário autenticado. Sem paginação. |
| /alerts | GET | Sem body; Bearer. | Array de { id, title, message, createdAt, updatedAt }, ordenado por createdAt desc. |
| /alerts/:id | GET | ID no caminho, codificado; Bearer. | Objeto Alert com os mesmos campos; 404 se não encontrado. |
| /alerts | POST | { title, message }, Bearer. Interface exige título e descrição; backend exige título e aceita message opcional/nulo. | 201 com Alert criado. Backend permite somente Admin ou Gerente; funcionário recebe 403. |

O frontend não interpreta 403 como expiração e não concede acesso com base no texto do erro. Mensagens { message } do backend são exibidas como texto React.

### Endpoints existentes que não foram usados para inventar recursos

- POST /reports cria somente { id, userId }, sem ler nome de cliente ou respostas. **Não foi usado como finalização de checklist**.
- GET /reports/:id e DELETE /reports/:id existem para registros do próprio usuário; o escopo pedido não exige exclusão.
- PUT/DELETE /alerts/:id existem para Admin/Gerente; não foram adicionadas telas de manutenção não solicitadas.
- POST /auth/register/tempLogin, PUT /auth/flags e DELETE /auth/:id existem, mas não foram expostos como menus administrativos sem especificação e sem informação confiável do perfil da sessão.
- Não existe endpoint de “me”, listagem de usuários ou leitura de permissões da sessão no código fornecido.
- Não foram criados endpoints fictícios de checklist, PDF, leitura de alerta, POPs ou vídeos.

### Regras efetivamente encontradas

- Flags válidas: Admin, Gerente, Funcionario; são cumulativas, sem endpoint de troca de perfil ativo.
- Leitura de alertas e operações de relatórios: qualquer uma dessas flags, com conta não temporária.
- Criar/editar/excluir alertas e gerar contas temporárias: Admin ou Gerente.
- Atribuir flags: Admin.
- Conta temporária ou sem flags é negada nos recursos protegidos por flagMiddleware.
- O backend garante a autorização a cada requisição; o frontend não consegue identificar o perfil com o retorno atual do login.

## D. Situação das funcionalidades e pendências

| Funcionalidade | Situação | Motivo / o que foi feito / o que falta |
| --- | --- | --- |
| Login, persistência, expiração e logout | Implementado no frontend | Usa contratos existentes, validado por testes e fixtures. Falta apenas validação com servidor/banco reais disponíveis. |
| Rotas protegidas por autenticação | Implementado | Token e expiração controlam navegação local; API continua responsável por validar o token. Sem endpoint de sessão, não há revalidação remota própria para páginas estáticas. |
| Identificação de perfil, menus e bloqueio visual por perfil | Parcial | Login não retorna flags, username ou isTemp; não há leitura da sessão. Removidos os perfis falsos e menus administrativos. Falta um contrato que forneça essas informações. Nenhum endpoint novo foi presumido. |
| Redirecionamento por cargo | Não implementado | Não é possível distinguir os cargos. Todos voltam à página solicitada ou ao Painel. Falta perfil confirmado da sessão. |
| Ativação temporária | Parcial | Formulário usa POST /auth/register e encerra sessão ao concluir. Não há detecção automática de conta temporária; usuário acessa a opção explicitamente. Falta isTemp na leitura da sessão para automatizar. |
| Criação/listagem/abertura de alertas | Implementado no frontend | GET/POST/GET por ID integrados. A publicação depende da autorização real do servidor. |
| Ocultar formulário de alerta de funcionários | Não implementado | Sem flags no login, não há base confiável para esconder o formulário por usuário. Ele informa a restrição e trata 403. A negativa não é usada para deduzir um cargo. |
| Funcionário publicar alerta | Não implementado por incompatibilidade de regra | O backend permite somente Admin/Gerente. A regra existente foi mantida. Qualquer mudança dependeria de decisão e trabalho no backend, fora deste escopo. |
| Alertas lidos/não lidos | Não implementado | Não há campos de leitura nem endpoint para registrar visualização. Interface informa indisponibilidade e não salva leitura fictícia no navegador. Falta contrato de leitura por usuário. |
| Contagem de alertas | Implementado | Comprimento do array real de alertas; nunca mistura fixtures no bundle. |
| Painel de checklists concluídos e risco | Parcial | Contagem de registros do próprio usuário funciona, separada de checklists concluídos. Não há conclusão, classificação ou regra de risco. Falta contrato dessas métricas/regras. |
| Perguntas e respostas do checklist | Parcial | Tela e nome do cliente preparados; conclusão bloqueada. Não há perguntas, opções, flags de risco ou persistência de respostas. Faltam catálogo de perguntas e contrato de envio. Não foram inventadas escalas de risco. |
| Finalização e identificador de checklist completo | Não implementado | Embora POST /reports gere ID de registro, ele ignora cliente e respostas. Não foram criados registros vazios apresentados como checklists. Falta armazenamento do checklist completo e regra de conclusão. |
| Checklists feitos | Parcial | GET /reports integrado; mostra somente registros do usuário. Não existe listagem global e não foram presumidas permissões globais para gerente/admin. Faltam cliente, data, status, risco e PDF. |
| PDF do checklist | Não implementado | Não existe geração, arquivo, URL ou conteúdo completo do checklist no backend. Botão fica indisponível. Faltam contrato/conteúdo do checklist e mecanismo de disponibilização do PDF. Não foi gerado PDF enganoso de um registro vazio. |
| POPs | Parcial | Página, catálogo de apresentação e ações de abrir/baixar preparados. Sem documentos e sem API correspondente, catálogo fica vazio. Faltam PDFs fornecidos e/ou contrato de listagem/armazenamento. |
| Conteúdo educativo | Parcial | Cards, título, descrição, thumbnail e abertura do YouTube implementados. Catálogo vazio, sem vídeos aleatórios. Faltam materiais definidos e/ou contrato de listagem. |
| Telas administrativas futuras | Não implementado | Não especificadas; não foram inventadas. Dependem de escopo funcional e leitura confiável de permissões. |

Para documentos externos, o atributo download pode ser ignorado pelo navegador em outra origem; nesse caso o PDF abre e o download depende do visualizador/servidor. Não existe PDF real para validar esse fluxo ainda.

## E. Testes e evidências

### Executados

1. Build de produção: **passou** com o Vite existente usando carregador nativo de configuração.
2. Lint dos fontes, testes e configuração: **passou sem avisos e sem erros**.
3. Dez testes de contrato/sessão: **10 passaram**. Cobrem body e headers do login, senha sem alteração, listas/Bearer, criação/detalhe de alerta, 401 versus 403, login inválido, logout 204, contrato de ativação, rede/timeout/HTML/500/lista inválida, expiração, corrupção e armazenamento bloqueado.
4. Navegador integrado com servidor isolado de fixtures, sem banco real:
   - Acesso direto a checklist sem sessão redirecionou para login.
   - Campos vazios bloqueados; login inválido exibiu mensagem.
   - Login válido retornou à página solicitada.
   - Recarregamento preservou sessão.
   - Checklist e PDF permaneceram desabilitados.
   - Funcionário recebeu 403 ao publicar, sem logout indevido.
   - Gerente e Admin receberam sucesso e viram o alerta na listagem.
   - Abertura do alerta carregou detalhes.
   - Listas vazias de alertas e relatórios exibiram estados vazios.
   - POPs e vídeos exibiram estados vazios próprios.
   - 401 limpou sessão e exibiu aviso no login.
   - Logout retornou ao login.
   - Navegação e aparência verificadas em desktop 1440×1000, tablet 820×1180 e celular 390×844.
   - Menu móvel abriu, navegou e fechou; Escape funcionou.
   - Tabela no celular com rolagem interna, sem expandir a largura da página.
   - Nenhum erro JavaScript capturado na revisão final.
5. Capturas entregues: painel-desktop.png, painel-tablet.png e painel-celular.png. **As contagens nelas são fixtures de teste**, não dados reais.

### Limitações dos testes

- O comando padrão de build inicialmente esbarrou em spawn EPERM ao executar a detecção de unidades de rede do Vite no Windows. O mesmo projeto compilou com --configLoader native, sem alterar Vite ou dependências.
- O lançamento automatizado de Edge por Playwright também foi bloqueado por spawn EPERM. O roteiro tests/browser-check.mjs foi fornecido, mas **não é relatado como uma suíte aprovada**. A revisão de navegador foi feita com a ferramenta de navegador integrada.
- A ativação foi testada no nível do contrato do serviço; o fluxo completo de conta temporária com banco não foi executado.
- Não foi realizada auditoria abrangente de acessibilidade nem testes em dispositivos físicos.
- Os testes de flags por fixtures verificam a reação da interface às respostas esperadas; não substituem testes reais de autorização no backend.

## F. Como executar

Na pasta Front-End/meu-app, com as dependências existentes:

~~~powershell
npm run dev
npm run lint
npm test
npm run build
~~~

Se o ambiente Windows bloquear o subprocesso de detecção do Vite:

~~~powershell
npm run build -- --configLoader native
~~~

Desenvolvimento: /auth, /reports e /alerts passam pelo proxy para http://localhost:3000. Para outro destino, copie .env.example para .env.local e ajuste API_PROXY_TARGET. Isso é configuração do **frontend**.

Produção: configure VITE_API_BASE_URL com a URL pública da API antes do build ou deixe vazio quando API e frontend compartilham a origem. A hospedagem do frontend precisa servir index.html para suas rotas do React Router. O build fica no dist do frontend; **não foi copiado para Back-End/public**.

O backend precisa ser disponibilizado pelo responsável com seu banco, configurações e cliente Prisma compatível. Isso não foi alterado nesta tarefa.

O catálogo local src/data/materiais.js permite adicionar materiais fornecidos futuramente. Esses objetos são modelos de apresentação locais; não representam endpoints ou campos prometidos pelo backend.
