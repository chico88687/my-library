# --- build-android.ps1 ---
# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host "1) Cleaning old web assets..."
if (Test-Path .\android\app\src\main\assets\public) {
    Remove-Item -Recurse -Force .\android\app\src\main\assets\public
}

Write-Host "2) Building Angular production bundle..."
ng build --configuration production

Write-Host "3) Copying web assets to Android project..."
npx cap copy android
npx cap sync android

Write-Host "4) Building APK (debug)..."
cd android
.\gradlew assembleDebug

Write-Host "5) Opening APK folder..."
$apkFolder = Join-Path $PWD "app\build\outputs\apk\debug"
Start-Process explorer.exe $apkFolder
Write-Host "Done! Find your app-debug.apk in the opened folder."
