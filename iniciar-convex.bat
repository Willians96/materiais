@echo off
echo ========================================
echo   Iniciar Convex - Desenvolvimento
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
echo Iniciando Convex...
echo.
echo IMPORTANTE:
echo - Se perguntar sobre criar projeto, digite: y
echo - Deixe este terminal aberto enquanto trabalha
echo.
call npx convex dev

pause

