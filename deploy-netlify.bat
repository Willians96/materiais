@echo off
echo ========================================
echo   Deploy Netlify - Producao
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
echo Verificando pasta dist...
if not exist dist (
    echo ERRO: Pasta dist nao encontrada!
    echo Execute build-prod.bat primeiro!
    pause
    exit /b 1
)

echo Pasta dist encontrada!
echo.

echo Fazendo deploy para Netlify...
echo IMPORTANTE: 
echo - Se for a primeira vez, voce precisara fazer login
echo - O navegador sera aberto para autenticacao
echo - Apos o login, volte ao terminal
echo.
pause

call npx netlify-cli deploy --prod --dir=dist

if errorlevel 1 (
    echo.
    echo ERRO: Falha no deploy
    echo.
    echo Tente executar manualmente:
    echo   npx netlify-cli deploy --prod --dir=dist
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deploy concluido com sucesso!
echo ========================================
echo.
echo Anote a URL de producao que apareceu acima!
echo.
pause

