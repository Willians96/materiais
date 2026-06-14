# Script para limpar e reinstalar dependências
Write-Host "Limpando node_modules e cache..." -ForegroundColor Yellow

# Remover node_modules
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✓ node_modules removido" -ForegroundColor Green
}

# Remover cache do Vite
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✓ Cache do Vite removido" -ForegroundColor Green
}

# Remover package-lock.json (opcional - descomente se quiser)
# Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue

Write-Host "`nInstalando dependências..." -ForegroundColor Yellow
npm install

Write-Host "`n✓ Concluído! Agora execute: npm run dev" -ForegroundColor Green

