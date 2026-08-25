$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Test-CommandExists {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "Vivliostyle PDF文書化環境のセットアップを開始します。"

if (-not (Test-CommandExists "node")) {
    Write-Error "Node.jsが見つかりません。Node.js 22.12以降のLTS版をインストールしてから再実行してください。"
}

if (-not (Test-CommandExists "npm")) {
    Write-Error "npmが見つかりません。Node.jsのインストール状態を確認してください。"
}

Write-Host ("Node.js: " + (node -v))
Write-Host ("npm: " + (npm -v))

if (Test-Path "package-lock.json") {
    Write-Host "package-lock.json に基づいて依存パッケージをインストールします。"
    npm ci
} else {
    Write-Host "依存パッケージをインストールします。初回実行後、package-lock.json が作成されます。"
    npm install
}
if ($LASTEXITCODE -ne 0) {
    Write-Error "依存パッケージのインストールに失敗しました。ネットワーク接続とnpmのエラーメッセージを確認してください。"
}

Write-Host ""
Write-Host "セットアップが完了しました。PDFを生成するには次を実行してください。"
Write-Host ".\build-pdf.ps1 project-document"
