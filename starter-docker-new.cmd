@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>&1
if errorlevel 1 (
  echo Docker nao foi encontrado. Instale e inicie o Docker Desktop.
  exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
  echo Docker Desktop nao esta iniciado. Inicie-o e execute este arquivo novamente.
  exit /b 1
)

if not exist ".env" (
  echo Arquivo .env nao encontrado. Copie .env.example para .env e configure as credenciais.
  exit /b 1
)

docker compose config --quiet
if errorlevel 1 (
  echo Configuracao do Docker Compose invalida. Confira o arquivo .env.
  exit /b 1
)

echo.
echo AVISO: esta operacao apaga o volume PostgreSQL e TODOS os dados do aplicativo,
echo incluindo contas, relatorios e alertas. O Admin sera recriado com as credenciais
echo definidas no arquivo .env.
echo.
choice /C SN /N /M "Deseja apagar os dados e iniciar do zero? [S/N] "
if errorlevel 2 (
  echo Operacao cancelada.
  exit /b 0
)

docker compose down --volumes --remove-orphans
if errorlevel 1 (
  echo Nao foi possivel parar os containers e remover o volume.
  exit /b 1
)

docker compose up --build -d
if errorlevel 1 (
  echo Nao foi possivel iniciar os containers.
  exit /b 1
)

echo Aguardando o servidor e as migrations...
for /L %%I in (1,1,60) do (
  curl.exe --fail --silent --output NUL http://localhost:3000
  if not errorlevel 1 goto create_admin
  timeout /t 2 /nobreak >nul
)

echo O servidor nao ficou pronto. Ultimos logs do backend:
docker compose logs --tail 50 backend
exit /b 1

:create_admin
docker compose exec -T backend npm run db:bootstrap-admin
if errorlevel 1 (
  echo Nao foi possivel criar o Admin. Confira as credenciais no .env e os logs:
  docker compose logs --tail 50 backend
  exit /b 1
)

start "" "http://localhost:3000"
echo Inicializacao limpa concluida. Aplicacao aberta em http://localhost:3000
exit /b 0
