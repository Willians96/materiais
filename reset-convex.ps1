# Script para resetar configuração do Convex
# Execute: .\reset-convex.ps1

Write-Host "🔄 Resetando configuração do Convex..." -ForegroundColor Yellow

# Limpar pastas e arquivos
Write-Host "📁 Limpando arquivos antigos..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .convex -ErrorAction SilentlyContinue
Remove-Item .env.local -ErrorAction SilentlyContinue
Write-Host "✅ Arquivos limpos!" -ForegroundColor Green

# Logout
Write-Host "🚪 Fazendo logout do Convex..." -ForegroundColor Cyan
npx convex logout

Write-Host ""
Write-Host "✅ Pronto! Agora execute:" -ForegroundColor Green
Write-Host "   npx convex login" -ForegroundColor White
Write-Host "   npx convex dev" -ForegroundColor White
Write-Host ""

