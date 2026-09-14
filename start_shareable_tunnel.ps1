# GeoResilience AI - Live Cloudflare Tunnel Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  GeoResilience AI: Starting Backend & Cloudflare Tunnels  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend (Port 8000)
Write-Host "[1/4] Starting FastAPI Backend on Port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "d:\SIH2026\backend\venv\Scripts\python.exe" -ArgumentList "-m uvicorn main:app --host 127.0.0.1 --port 8000" -WorkingDirectory "d:\SIH2026\backend" -WindowStyle Hidden

# 2. Start Frontend Operational Console (Port 5173)
Write-Host "[2/4] Starting Frontend Operational Console on Port 5173..." -ForegroundColor Yellow
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "d:\SIH2026\frontend" -WindowStyle Hidden

# 3. Start Tactical Simulator (Port 5174)
Write-Host "[3/4] Starting Tactical Simulator on Port 5174..." -ForegroundColor Yellow
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "d:\SIH2026\manual-control" -WindowStyle Hidden

Start-Sleep -Seconds 4

# 4. Launch Cloudflare Tunnel
Write-Host "[4/4] Launching Public Cloudflare Tunnel for Frontend..." -ForegroundColor Green
cloudflared tunnel --url http://localhost:5173
