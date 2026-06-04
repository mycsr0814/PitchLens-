# Release APK 서명용 keystore 생성 + GitHub Secrets에 넣을 Base64 출력
# JDK keytool 필요 (Android Studio 설치 시 포함)
#
# 사용: powershell -ExecutionPolicy Bypass -File scripts/export-android-keystore-secrets.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $Root "android\app"
$Keystore = Join-Path $OutDir "pitchlens-release.keystore"
$Alias = "pitchlens"
$StorePass = "pitchlens2026"
$KeyPass = $StorePass

if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    Write-Error "keytool 을 찾을 수 없습니다. JDK/Android Studio PATH를 확인하세요."
}

if (-not (Test-Path $Keystore)) {
    Write-Host "keystore 생성: $Keystore"
    keytool -genkeypair -v `
        -storetype PKCS12 `
        -keystore $Keystore `
        -alias $Alias `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass $StorePass `
        -keypass $KeyPass `
        -dname "CN=PitchLens, OU=Capstone, O=PitchLens, L=Seoul, ST=Seoul, C=KR"
} else {
    Write-Host "기존 keystore 사용: $Keystore"
}

$bytes = [IO.File]::ReadAllBytes($Keystore)
$b64 = [Convert]::ToBase64String($bytes)

Write-Host ""
Write-Host "======== GitHub Repository Secrets (Settings -> Secrets -> Actions) ========"
Write-Host "ANDROID_KEYSTORE_BASE64  = (아래 한 줄 전체)"
Write-Host $b64
Write-Host "ANDROID_KEYSTORE_PASSWORD = $StorePass"
Write-Host "ANDROID_KEY_ALIAS         = $Alias"
Write-Host "ANDROID_KEY_PASSWORD      = $KeyPass"
Write-Host "=========================================================================="
Write-Host ""
Write-Host "주의: keystore 파일($Keystore)은 Git에 올리지 마세요."
