# Starts the Cafeino Bistro POS (backend + frontend) and opens it in the browser.
# Launched by "Start Cafeino.bat". Safe to run again while the app is already running.
#
#   -NoBrowser   start everything but don't open the browser (for testing)
#
# First run / after an update (git pull) it installs packages and builds the website.
# Server output goes to the "logs" folder next to this project.
param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$Root     = Split-Path -Parent $PSScriptRoot
$Backend  = Join-Path $Root 'backend-nodejs'
$Frontend = Join-Path $Root 'frontend'
$Logs     = Join-Path $Root 'logs'
$AppUrl   = 'http://localhost:3000'
$ApiUrl   = 'http://localhost:8000/health'
New-Item -ItemType Directory -Force -Path $Logs | Out-Null

function Say([string]$Message, [string]$Color = 'Gray') {
  Write-Host "  $Message" -ForegroundColor $Color
}

function Stop-WithError([string]$Message) {
  Write-Host ''
  Say "PROBLEM: $Message" 'Red'
  Say "Technical details are in this folder: $Logs" 'DarkGray'
  Write-Host ''
  Read-Host '  Press Enter to close'
  exit 1
}

function Test-Url([string]$Url) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
    return ($response.StatusCode -eq 200)
  } catch {
    return $false
  }
}

# Node may be on the PATH (normal install) or only inside nvm's folder.
function Find-NodeDir {
  $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($cmd) { return (Split-Path $cmd.Source) }
  $dirs = @(Join-Path $env:ProgramFiles 'nodejs')
  if ($env:NVM_HOME -and (Test-Path $env:NVM_HOME)) {
    $dirs += Get-ChildItem $env:NVM_HOME -Directory -Filter 'v*' |
      Sort-Object { try { [version]$_.Name.TrimStart('v') } catch { [version]'0.0' } } -Descending |
      ForEach-Object { $_.FullName }
  }
  foreach ($dir in $dirs) {
    if (Test-Path (Join-Path $dir 'node.exe')) { return $dir }
  }
  return $null
}

# Runs "npm <args>" in a folder, hidden, and waits. Returns the exit code.
function Invoke-Npm([string]$Dir, [string]$NpmArgs, [string]$LogName) {
  $log = Join-Path $Logs $LogName
  "`r`n===== npm $NpmArgs in $Dir - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====" | Out-File -FilePath $log -Append -Encoding ascii
  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList "/c npm $NpmArgs >> `"$log`" 2>&1" `
    -WorkingDirectory $Dir -WindowStyle Hidden -Wait -PassThru
  return $proc.ExitCode
}

# Installs packages when node_modules is missing or package-lock.json changed (after an update).
# Uses "npm ci" so package-lock.json is never modified (keeps "git pull" clean).
function Install-PackagesIfNeeded([string]$Dir, [string]$Label) {
  $hash = (Get-FileHash (Join-Path $Dir 'package-lock.json') -Algorithm SHA256).Hash
  $stampFile = Join-Path $Dir 'node_modules\.cafeino-lock-hash'
  $installed = ''
  if (Test-Path $stampFile) { $installed = (Get-Content $stampFile -Raw).Trim() }
  if ((Test-Path (Join-Path $Dir 'node_modules')) -and ($installed -eq $hash)) { return }

  Say "Installing the $Label (first time or after an update - this can take a few minutes)..."
  if ((Invoke-Npm $Dir 'ci' 'install.log') -ne 0) {
    Stop-WithError "Could not install the $Label. Check the internet connection, then try again."
  }
  Set-Content -Path $stampFile -Value $hash -Encoding ascii
}

# Starts "npm start" hidden in the background. Output goes to the log file.
function Start-Server([string]$Dir, [string]$LogName) {
  $log = Join-Path $Logs $LogName
  "`r`n===== started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====" | Out-File -FilePath $log -Append -Encoding ascii
  return Start-Process -FilePath 'cmd.exe' -ArgumentList "/c npm start >> `"$log`" 2>&1" `
    -WorkingDirectory $Dir -WindowStyle Hidden -PassThru
}

# Waits until the URL answers, or gives up if the server stopped or time ran out.
function Wait-Ready([string]$Url, $Proc, [int]$Seconds) {
  for ($i = 0; $i -lt $Seconds; $i++) {
    if (Test-Url $Url) { return $true }
    if ($Proc -and $Proc.HasExited) { return $false }
    Start-Sleep -Seconds 1
  }
  return $false
}

function Open-App {
  if ($NoBrowser) { return }
  # Edge "app" window: full screen, no address bar or tabs. Falls back to the default browser.
  $edge = @(
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
  ) | Where-Object { Test-Path $_ } | Select-Object -First 1
  if ($edge) {
    Start-Process -FilePath $edge -ArgumentList "--app=$AppUrl", '--start-maximized'
  } else {
    Start-Process $AppUrl
  }
}

# ---------------------------------------------------------------------------

Write-Host ''
Say 'CAFEINO BISTRO - starting the till...' 'Yellow'
Write-Host ''

$backendUp  = Test-Url $ApiUrl
$frontendUp = Test-Url $AppUrl

if ($backendUp -and $frontendUp) {
  Say 'Already running.' 'Green'
} else {
  $nodeDir = Find-NodeDir
  if (-not $nodeDir) { Stop-WithError 'Node.js is not installed on this computer.' }
  $env:Path = "$nodeDir;$env:Path"

  if (-not (Test-Path (Join-Path $Backend '.env'))) {
    Stop-WithError 'The settings file "backend-nodejs\.env" is missing.'
  }

  if (-not $backendUp) {
    Install-PackagesIfNeeded $Backend 'server'
    Say 'Starting the server...'
    $backendProc = Start-Server $Backend 'backend.log'
  }

  if (-not $frontendUp) {
    Install-PackagesIfNeeded $Frontend 'website'

    # Rebuild when there is no build yet, or the code changed since the last build (after git pull).
    $commit = ''
    try { $commit = [string](& git -C $Root rev-parse HEAD 2>$null) } catch { $commit = '' }
    $stamp = Join-Path $Frontend '.next\cafeino-build-commit.txt'
    $builtCommit = ''
    if (Test-Path $stamp) { $builtCommit = (Get-Content $stamp -Raw).Trim() }
    $hasBuild = Test-Path (Join-Path $Frontend '.next\BUILD_ID')
    if ((-not $hasBuild) -or ($commit -and ($commit -ne $builtCommit))) {
      Say 'Preparing the website (first time or after an update - this can take a few minutes)...'
      if ((Invoke-Npm $Frontend 'run build' 'build.log') -ne 0) {
        Stop-WithError 'Could not prepare the website.'
      }
      if ($commit) { Set-Content -Path $stamp -Value $commit -Encoding ascii }
    }

    Say 'Starting the website...'
    $frontendProc = Start-Server $Frontend 'frontend.log'
  }

  if (-not $backendUp) {
    if (-not (Wait-Ready $ApiUrl $backendProc 90)) {
      Stop-WithError 'The server did not start. Check that this computer is connected to the internet (the database is online), then try again.'
    }
  }
  if (-not $frontendUp) {
    if (-not (Wait-Ready $AppUrl $frontendProc 90)) {
      Stop-WithError 'The website did not start.'
    }
  }
  Say 'Ready!' 'Green'
}

Open-App
Write-Host ''
Say 'Cafeino is running. This window will close by itself.' 'Green'
Say 'To turn the till off, double-click "Stop Cafeino".' 'DarkGray'
Start-Sleep -Seconds 6
