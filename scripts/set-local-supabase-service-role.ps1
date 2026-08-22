param(
  [string]$ProjectUrl = "https://ysddeszckbpmfhyrikxe.supabase.co",
  [switch]$UseClipboard
)

function Set-SupabaseValues([string]$TargetPath, [string]$ServiceRoleKey) {
  $values = [ordered]@{}
  if (Test-Path $TargetPath) {
    Get-Content $TargetPath | ForEach-Object {
      if ($_ -match '^([^#=]+)=(.*)$') { $values[$Matches[1].Trim()] = $Matches[2] }
    }
  }
  $values['SUPABASE_URL'] = $ProjectUrl
  $values['SUPABASE_SERVICE_ROLE_KEY'] = $ServiceRoleKey
  $lines = @($values.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" })
  Set-Content -Path $TargetPath -Value $lines -Encoding utf8
}

$projectRoot = Split-Path -Parent $PSScriptRoot
if ($UseClipboard) {
  $plainKey = (Get-Clipboard -Raw).Trim()
} else {
  $key = Read-Host "Paste the Supabase service-role key for local persistence" -AsSecureString
  $keyBstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($key)
  try { $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyBstr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyBstr) }
}
if ([string]::IsNullOrWhiteSpace($plainKey) -or $plainKey.Length -lt 40) { throw "No complete Supabase service-role key was received. Copy the full key, then rerun this script with -UseClipboard." }

Set-SupabaseValues (Join-Path $projectRoot "apps\admin\.env.local") $plainKey
Set-SupabaseValues (Join-Path $projectRoot "apps\storefront\.env.local") $plainKey
Write-Host "Local Supabase persistence is configured for the admin and storefront. Restart pnpm dev."
