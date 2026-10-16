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

docker compose up --build -d
if errorlevel 1 (
  echo Nao foi possivel iniciar os containers.
  exit /b 1
)

echo Aguardando o servidor ficar pronto...
for /L %%I in (1,1,60) do (
  curl.exe --fail --silent --output NUL http://localhost:3000
  if not errorlevel 1 (
    start "" "http://localhost:3000"
    echo Aplicacao aberta em http://localhost:3000
    exit /b 0
  )
  timeout /t 2 /nobreak >nul
)

echo O servidor nao ficou pronto. Ultimos logs do backend:
docker compose logs --tail 50 backend
exit /b 1
