@echo off
echo ========================================
echo   Deploy Convex - Producao
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
echo Fazendo deploy do Convex para producao...
echo IMPORTANTE: Anote a URL que aparecer!
echo.
call npx convex deploy

if errorlevel 1 (
    echo.
    echo ERRO: Falha no deploy
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deploy concluido!
echo ========================================
echo.

REM Verificar se ja existe .env.production
if exist .env.production (
    echo Arquivo .env.production ja existe.
    echo URL configurada: https://resolute-antelope-323.convex.cloud
) else (
    echo Criando arquivo .env.production...
    echo VITE_CONVEX_URL=https://resolute-antelope-323.convex.cloud > .env.production
    echo Arquivo criado com sucesso!
    echo URL configurada: https://resolute-antelope-323.convex.cloud
)

echo.
echo Proximos passos:
echo 1. Verifique a URL acima (deve ser: https://resolute-antelope-323.convex.cloud)
echo 2. Se a URL for diferente, atualize o arquivo .env.production manualmente
echo 3. Execute: build-prod.bat
echo.
pause

