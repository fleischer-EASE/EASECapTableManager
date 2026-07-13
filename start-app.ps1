param(
  [ValidateRange(1024, 65535)]
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$candidates = @(
  [pscustomobject]@{ Command = 'py'; Prefix = @('-3') },
  [pscustomobject]@{ Command = 'python'; Prefix = @() },
  [pscustomobject]@{ Command = 'python3'; Prefix = @() }
)

$python = $null
foreach ($candidate in $candidates) {
  if (Get-Command $candidate.Command -ErrorAction SilentlyContinue) {
    $python = $candidate
    break
  }
}

if ($null -eq $python) {
  Write-Warning 'Python wurde nicht gefunden. Die App wird direkt als lokale Datei geöffnet.'
  Start-Process -FilePath (Join-Path $PSScriptRoot 'index.html')
  exit 0
}

$url = "http://127.0.0.1:$Port/"
$openBrowser = "Start-Sleep -Milliseconds 700; Start-Process '$url'"
Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-Command', $openBrowser) -WindowStyle Hidden

Write-Host "EASE Cap Table Manager läuft unter $url"
Write-Host 'Zum Beenden Strg+C drücken.'

$arguments = @($python.Prefix) + @('-m', 'http.server', $Port, '--bind', '127.0.0.1')
& $python.Command $arguments
