# Script de Deploy para Produção
# Execute este script passo a passo

Write-Host "🚀 Script de Deploy - Controle de Materiais PMESP" -ForegroundColor Cyan
Write-Host ""

# Verificar se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta frontend!" -ForegroundColor Red
    exit 1
}

# Passo 1: Login no Convex
Write-Host "📋 Passo 1: Login no Convex" -ForegroundColor Yellow
Write-Host "Execute manualmente: npx convex login" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Você já fez login no Convex? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Por favor, execute: npx convex login" -ForegroundColor Yellow
    Write-Host "Depois execute este script novamente." -ForegroundColor Yellow
    exit 0
}

# Passo 2: Deploy do Convex
Write-Host ""
Write-Host "📋 Passo 2: Deploy do Convex para Produção" -ForegroundColor Yellow
Write-Host "Executando: npx convex deploy --prod" -ForegroundColor White
Write-Host ""
$deploy = Read-Host "Deseja executar o deploy do Convex agora? (S/N)"
if ($deploy -eq "S" -or $deploy -eq "s") {
    npx convex deploy --prod
    Write-Host ""
    Write-Host "✅ Anote a URL do Convex que apareceu acima!" -ForegroundColor Green
    Write-Host ""
    $convexUrl = Read-Host "Cole a URL do Convex aqui (ex: https://xxxxx.convex.cloud)"
    
    # Passo 3: Criar .env.production
    Write-Host ""
    Write-Host "📋 Passo 3: Criando arquivo .env.production" -ForegroundColor Yellow
    $envContent = "VITE_CONVEX_URL=$convexUrl"
    Set-Content -Path ".env.production" -Value $envContent
    Write-Host "✅ Arquivo .env.production criado!" -ForegroundColor Green
    
    # Passo 4: Build
    Write-Host ""
    Write-Host "📋 Passo 4: Build de Produção" -ForegroundColor Yellow
    Write-Host "Executando: npm run build:prod" -ForegroundColor White
    Write-Host ""
    $build = Read-Host "Deseja executar o build agora? (S/N)"
    if ($build -eq "S" -or $build -eq "s") {
        npm run build:prod
        Write-Host ""
        Write-Host "✅ Build concluído! Arquivos em: dist/" -ForegroundColor Green
    }
} else {
    Write-Host "Deploy do Convex cancelado." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Próximos Passos:" -ForegroundColor Cyan
Write-Host "1. Se o build foi concluído, os arquivos estão em frontend/dist/" -ForegroundColor White
Write-Host "2. Escolha um método de deploy:" -ForegroundColor White
Write-Host "   - Vercel: npm install -g vercel && vercel --prod" -ForegroundColor Gray
Write-Host "   - Netlify: npm install -g netlify-cli && netlify deploy --prod" -ForegroundColor Gray
Write-Host "   - Servidor próprio: Copie dist/ para o servidor web" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Script concluído!" -ForegroundColor Green

