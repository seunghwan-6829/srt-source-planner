# SRT 소스 플래너 - 한 번에 배포 (커밋 + 푸시 → Vercel 자동 배포)
Set-Location $PSScriptRoot

$status = git status --short
if (-not [string]::IsNullOrWhiteSpace($status)) {
  git add .
  $msg = "deploy: " + (Get-Date -Format "yyyy-MM-dd HH:mm")
  git commit -m $msg
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "커밋 완료." -ForegroundColor Cyan
} else {
  Write-Host "커밋할 변경 없음. 푸시만 시도합니다." -ForegroundColor Yellow
}

git push origin main
if ($LASTEXITCODE -eq 0) {
  Write-Host "`n푸시 완료. Vercel에서 자동 배포됩니다." -ForegroundColor Green
} else {
  Write-Host "`n푸시 실패. 위 오류를 확인하세요." -ForegroundColor Red
  exit $LASTEXITCODE
}
