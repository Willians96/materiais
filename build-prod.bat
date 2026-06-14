@echo off
echo ========================================
echo   Build de Producao
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)

echo.
echo Verificando arquivo .env.production...
if not exist .env.production (
    echo.
    echo AVISO: Arquivo .env.production nao encontrado!
    echo.
    echo Crie o arquivo .env.production com:
    echo VITE_CONVEX_URL=https://sua-url.convex.cloud
    echo.
    pause
    exit /b 1
)

echo Arquivo .env.production encontrado!
echo.

echo Executando build de producao...
echo Isso pode levar alguns minutos...
echo.
call npm run build:prod

if errorlevel 1 (
    echo.
    echo ERRO: Falha no build
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build concluido com sucesso!
echo ========================================
echo.
echo Os arquivos estao em: frontend\dist\
echo.
echo Proximos passos:
echo 1. Copie a pasta dist\ para o servidor web
echo 2. Ou use Vercel/Netlify para deploy automatico
echo.
pause

