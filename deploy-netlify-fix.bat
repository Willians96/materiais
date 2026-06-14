@echo off
echo ========================================
echo   Deploy Netlify - Producao (Fix)
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
echo Usando metodo alternativo para evitar erro do CLI...
echo.

REM Tentar deploy direto sem interacao
call npx netlify-cli deploy --prod --dir=dist --json 2>nul

if errorlevel 1 (
    echo.
    echo Tentando metodo alternativo...
    echo.
    
    REM Tentar criar site diretamente
    call npx netlify-cli deploy --create-site controle-materiais-pmesp --dir=dist --prod
    
    if errorlevel 1 (
        echo.
        echo ERRO: Falha no deploy
        echo.
        echo SOLUCAO ALTERNATIVA:
        echo 1. Acesse: https://app.netlify.com
        echo 2. Clique em "Add new site" ^> "Deploy manually"
        echo 3. Arraste a pasta dist\ para a area de upload
        echo 4. Aguarde o deploy
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Deploy concluido!
echo ========================================
echo.
echo Verifique a URL no dashboard: https://app.netlify.com
echo.
pause

