@echo off
echo ========================================
echo   Deploy - Controle de Materiais PMESP
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)

echo.
echo [2/4] Login no Convex...
echo Abrindo navegador para login...
call npx convex login
if errorlevel 1 (
    echo ERRO: Falha no login do Convex
    pause
    exit /b 1
)

echo.
echo [3/4] Deploy do Convex para Producao...
echo IMPORTANTE: Anote a URL que aparecer!
call npx convex deploy
if errorlevel 1 (
    echo ERRO: Falha no deploy do Convex
    pause
    exit /b 1
)

echo.
echo [4/4] Configurando variavel de ambiente...
set /p CONVEX_URL="Cole a URL do Convex aqui (ex: https://xxxxx.convex.cloud): "
echo VITE_CONVEX_URL=%CONVEX_URL% > .env.production
echo Arquivo .env.production criado!

echo.
echo [5/5] Build de Producao...
call npm run build:prod
if errorlevel 1 (
    echo ERRO: Falha no build
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo ========================================
echo.
echo Proximos passos:
echo 1. Os arquivos estao em: frontend\dist\
echo 2. Escolha um metodo de deploy:
echo    - Vercel: npm install -g vercel ^&^& vercel --prod
echo    - Netlify: npm install -g netlify-cli ^&^& netlify deploy --prod
echo    - Servidor proprio: Copie dist\ para o servidor web
echo.
pause

