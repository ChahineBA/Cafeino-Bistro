# Starts the Cafeino Bistro POS (backend + frontend) and opens it in the browser.
# Launched by "Start Cafeino.bat". Safe to run again while the app is already running.
#
#   -NoBrowser   start everything but don't open the browser (for testing)
#   -NoUpdate    don't check GitHub for updates
#   -CheckNode   only show where Node.js was found (troubleshooting), then exit
#
# On a fresh start it first downloads updates from GitHub (fast-forward only; skipped
# quietly when offline). First run / after an update it installs packages and builds the
# website. Server output goes to the "logs" folder next to this project.
param([switch]$NoBrowser, [switch]$CheckNode, [switch]$NoUpdate)

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

$MinNodeVersion = [version]'20.9'   # required by Next.js 16

function Get-VersionFromName([string]$Name) {
  try { return [version]($Name.Trim().TrimStart('v')) } catch { return [version]'0.0' }
}

function Join-IfSet([string]$Base, [string]$Child) {
  if ($Base) { return (Join-Path $Base $Child) }
  return $null
}

# Folders that may contain node.exe, most preferred first. Covers a normal install and
# version managers whose Node is NOT on the PATH when the app is started by double-click:
# fnm (shell-only PATH), nvm-windows, and Scoop.
function Get-NodeCandidates {
  $dirs = New-Object System.Collections.Generic.List[string]
  $cmd = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($cmd) { $dirs.Add((Split-Path $cmd.Source)) }

  # fnm: <FNM_DIR>\aliases\default, then <FNM_DIR>\node-versions\<version>\installation (newest first)
  $fnmRoots = @($env:FNM_DIR, (Join-IfSet $env:APPDATA 'fnm'), (Join-IfSet $env:LOCALAPPDATA 'fnm'), (Join-IfSet $env:USERPROFILE '.fnm')) |
    Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique
  foreach ($fnm in $fnmRoots) {
    $dirs.Add((Join-Path $fnm 'aliases\default'))
    $versions = Join-Path $fnm 'node-versions'
    if (Test-Path $versions) {
      Get-ChildItem $versions -Directory -Filter 'v*' |
        Sort-Object { Get-VersionFromName $_.Name } -Descending |
        ForEach-Object { $dirs.Add((Join-Path $_.FullName 'installation')) }
    }
  }

  # nvm-windows: active version link, then installed versions (newest first)
  if ($env:NVM_SYMLINK) { $dirs.Add($env:NVM_SYMLINK) }
  if ($env:NVM_HOME -and (Test-Path $env:NVM_HOME)) {
    Get-ChildItem $env:NVM_HOME -Directory -Filter 'v*' |
      Sort-Object { Get-VersionFromName $_.Name } -Descending |
      ForEach-Object { $dirs.Add($_.FullName) }
  }

  # Standard installer and Scoop
  $dirs.Add((Join-IfSet $env:ProgramFiles 'nodejs'))
  $dirs.Add((Join-IfSet $env:USERPROFILE 'scoop\apps\nodejs-lts\current'))
  $dirs.Add((Join-IfSet $env:USERPROFILE 'scoop\apps\nodejs\current'))

  return $dirs | Where-Object { $_ } | Select-Object -Unique
}

# Returns @{ Dir; Version } for the first Node.js that is new enough, or $null.
# Fills $script:NodeReport with what was checked (shown/logged when nothing suitable is found).
function Find-Node {
  $script:NodeReport = New-Object System.Collections.Generic.List[string]
  foreach ($dir in Get-NodeCandidates) {
    $exe = Join-Path $dir 'node.exe'
    if (-not (Test-Path $exe)) { $script:NodeReport.Add("  not found:  $dir"); continue }
    $version = ''
    try { $version = ([string](& $exe -v)).Trim() } catch { $version = '' }
    if ((Get-VersionFromName $version) -ge $MinNodeVersion) {
      $script:NodeReport.Add("  USING $version  $dir")
      return @{ Dir = $dir; Version = $version }
    }
    $script:NodeReport.Add("  too old ($version, need $MinNodeVersion+):  $dir")
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

# Runs "git <args>" in the project, hidden, with a time limit. Returns the exit code, or -1 on timeout.
function Invoke-Git([string]$GitArgs, [int]$TimeoutSec) {
  $log = Join-Path $Logs 'update.log'
  "`r`n===== git $GitArgs - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') =====" | Out-File -FilePath $log -Append -Encoding ascii
  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList "/c git $GitArgs >> `"$log`" 2>&1" `
    -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  $null = $proc.Handle   # needed so ExitCode is available later (PowerShell 5.1)
  if (-not $proc.WaitForExit($TimeoutSec * 1000)) {
    try { & taskkill.exe /T /F /PID $proc.Id | Out-Null } catch {}
    "  (timed out after $TimeoutSec s)" | Out-File -FilePath $log -Append -Encoding ascii
    return -1
  }
  return $proc.ExitCode
}

# Downloads new commits from GitHub if there are any. Never blocks the start:
# no git, no internet, expired login or local changes -> keep the current version.
function Update-App {
  $ErrorActionPreference = 'Continue'
  if (-not (Get-Command git.exe -ErrorAction SilentlyContinue)) { return }
  if (-not (Test-Path (Join-Path $Root '.git'))) { return }

  # Fail instead of showing a GitHub login window if the saved login expired.
  $env:GIT_TERMINAL_PROMPT = '0'
  $env:GCM_INTERACTIVE = 'never'

  Say 'Checking for updates...'
  if ((Invoke-Git 'fetch --quiet' 45) -ne 0) {
    Say 'Could not check for updates (no internet?). Starting the current version.' 'DarkYellow'
    return
  }
  $behind = 0
  try { $behind = [int](& git -C $Root rev-list --count 'HEAD..@{u}' 2>$null) } catch { $behind = 0 }
  if ($behind -le 0) { Say 'Up to date.'; return }

  Say "Downloading the update ($behind new change(s))..."
  if ((Invoke-Git 'merge --ff-only --quiet @{u}' 60) -ne 0) {
    Say 'Could not apply the update (files were changed on this computer). Starting the current version.' 'DarkYellow'
    return
  }
  Say 'Updated.' 'Green'
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

if ($CheckNode) {
  Write-Host ''
  $node = Find-Node
  Say 'Places checked for Node.js, in order:' 'Yellow'
  $script:NodeReport | ForEach-Object { Write-Host "  $_" }
  Write-Host ''
  if ($node) { Say "OK - the till will use Node.js $($node.Version)" 'Green' }
  else { Say "No suitable Node.js found (need $MinNodeVersion or newer)." 'Red' }
  Write-Host ''
  Read-Host '  Press Enter to close'
  exit 0
}

Write-Host ''
Say 'CAFEINO BISTRO - starting the till...' 'Yellow'
Write-Host ''

$backendUp  = Test-Url $ApiUrl
$frontendUp = Test-Url $AppUrl

if ($backendUp -and $frontendUp) {
  Say 'Already running.' 'Green'
} else {
  # Update only on a fresh start, never while part of the till is still running.
  if (-not $NoUpdate -and -not $backendUp -and -not $frontendUp) { Update-App }

  $node = Find-Node
  $script:NodeReport | Out-File -FilePath (Join-Path $Logs 'node-search.log') -Encoding ascii
  if (-not $node) {
    Stop-WithError "Node.js $MinNodeVersion or newer was not found on this computer. (Run 'Start Cafeino.bat -CheckNode' to see where it looked.)"
  }
  $env:Path = "$($node.Dir);$env:Path"

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
