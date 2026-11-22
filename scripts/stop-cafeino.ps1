# Stops the Cafeino Bistro POS servers (the Node processes on ports 3000 and 8000).
# Launched by "Stop Cafeino.bat".
$ErrorActionPreference = 'SilentlyContinue'

Write-Host ''
Write-Host '  CAFEINO BISTRO - stopping the till...' -ForegroundColor Yellow

$stopped = 0
foreach ($port in 3000, 8000) {
  foreach ($conn in (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) {
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    # Only stop Node (our servers), never anything else that might use these ports.
    if ($proc -and $proc.ProcessName -eq 'node') {
      Stop-Process -Id $proc.Id -Force
      $stopped++
    }
  }
}

if ($stopped -gt 0) {
  Write-Host '  Stopped.' -ForegroundColor Green
} else {
  Write-Host '  It was not running.' -ForegroundColor Green
}
Start-Sleep -Seconds 3
