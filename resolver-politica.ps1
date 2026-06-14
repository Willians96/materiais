# Script para resolver problema de política de execução do PowerShell
# Execute este script como Administrador OU execute os comandos manualmente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resolver Política de Execução" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($isAdmin) {
    Write-Host "✓ Executando como Administrador" -ForegroundColor Green
    Write-Host ""
    Write-Host "Configurando política para CurrentUser..." -ForegroundColor Yellow
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✓ Política configurada!" -ForegroundColor Green
} else {
    Write-Host "⚠ Não está executando como Administrador" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tentando configurar para CurrentUser (pode pedir confirmação)..." -ForegroundColor Yellow
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "✓ Política configurada!" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao configurar política" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUÇÃO ALTERNATIVA:" -ForegroundColor Cyan
        Write-Host "1. Abra o PowerShell como Administrador" -ForegroundColor White
        Write-Host "2. Execute: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor White
        Write-Host "3. Ou use o Prompt de Comando (cmd.exe) ao invés do PowerShell" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "Verificando política atual..." -ForegroundColor Yellow
Get-ExecutionPolicy -List | Format-Table

Write-Host ""
Write-Host "Testando npx..." -ForegroundColor Yellow
try {
    $npxVersion = npx --version 2>&1
    Write-Host "✓ npx funciona! Versão: $npxVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npx ainda não funciona" -ForegroundColor Red
    Write-Host ""
    Write-Host "Use o Prompt de Comando (cmd.exe) ao invés do PowerShell:" -ForegroundColor Yellow
    Write-Host "  cd V:\controle\frontend" -ForegroundColor White
    Write-Host "  npx convex dev" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

