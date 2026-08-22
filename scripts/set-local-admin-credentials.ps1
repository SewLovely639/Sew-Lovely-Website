param(
  [string]$Email
)

function Read-LocalEnv([string]$TargetPath) {
  $values = [ordered]@{}
  if (Test-Path $TargetPath) {
    Get-Content $TargetPath | ForEach-Object {
      if ($_ -match '^([^#=]+)=(.*)$') { $values[$Matches[1].Trim()] = $Matches[2] }
    }
  }
  return $values
}

function Write-LocalEnv([string]$TargetPath, [System.Collections.Specialized.OrderedDictionary]$Values) {
  $lines = @($Values.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" })
  Set-Content -Path $TargetPath -Value $lines -Encoding utf8
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$target = Join-Path $projectRoot "apps\admin\.env.local"

if ([string]::IsNullOrWhiteSpace($Email)) { $Email = Read-Host "Enter the email address you want to use for local admin login" }
if ($Email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') { throw "Enter a valid email address." }

$password = Read-Host "Enter a new local admin password (8+ characters)" -AsSecureString
$passwordBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
try { $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordBstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordBstr) }
if ($plainPassword.Length -lt 8) { throw "The local admin password must contain at least 8 characters." }

$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$sessionSecret = [Convert]::ToBase64String($bytes)
$values = Read-LocalEnv $target
$values['ADMIN_EMAIL'] = $Email
$values['ADMIN_PASSWORD'] = $plainPassword
$values['ADMIN_SESSION_SECRET'] = $sessionSecret
Write-LocalEnv $target $values
Write-Host "Local admin login is configured. Restart the admin development server, then open http://localhost:3002/login."
