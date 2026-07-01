# PlayPro ecart — Windows setup helper
# Run from PowerShell:  .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

$nodeDir = "C:\Program Files\nodejs"
$nodeExe = Join-Path $nodeDir "node.exe"
$npmCmd = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $nodeExe)) {
    Write-Host ""
    Write-Host "Node.js was not found at: $nodeDir" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Node.js 20 LTS (or newer):" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "During install, check: 'Add to PATH'" -ForegroundColor Yellow
    exit 1
}

# Ensure this session can run node/npm
$env:Path = "$nodeDir;$env:Path"

Write-Host "Node:  $(& $nodeExe --version)"
Write-Host "npm:   $(& $npmCmd --version)"
Write-Host ""

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "Created .env.local from .env.example" -ForegroundColor Green
    }
}

Write-Host "Running npm install..." -ForegroundColor Cyan
& $npmCmd install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Start the dev server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "If 'npm' is still not recognized in a NEW terminal, add Node to PATH:" -ForegroundColor Yellow
Write-Host "  System Properties -> Environment Variables -> Path -> New -> $nodeDir" -ForegroundColor White
Write-Host "  Then close and reopen PowerShell / Cursor." -ForegroundColor White
