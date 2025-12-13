# start-dev.ps1 - start model server and frontend dev server (PowerShell)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting model server..."
Start-Process -NoNewWindow -WorkingDirectory $root -FilePath "python" -ArgumentList "-m","uvicorn","model_server:app","--reload","--port","8000"

Start-Sleep -Seconds 1

Write-Host "Starting frontend dev server..."
Start-Process -NoNewWindow -WorkingDirectory (Join-Path $root "4greener-ui") -FilePath "npm" -ArgumentList "run","dev"

Write-Host "Both processes started. Open http://localhost:5173 in your browser."