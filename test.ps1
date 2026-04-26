$ErrorActionPreference = "Stop"

# DEV-ID: dev-autostart
# Script de desarrollo: abre la app automáticamente y mantiene HMR activo.
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\test.ps1

Set-Location $PSScriptRoot

if (-not (Test-Path ".\\node_modules")) {
  Write-Host "node_modules no existe. Instalando dependencias con npm install..." -ForegroundColor Yellow
  npm install
}

# Vite ya recarga la app tras cada cambio (HMR). --open abre el navegador al iniciar.
npm run dev -- --open

