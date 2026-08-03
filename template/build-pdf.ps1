$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Test-CommandExists {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "Vivliostyle PDF文書の生成を開始します。"

if (-not (Test-CommandExists "node")) {
    Write-Error "Node.jsが見つかりません。初回セットアップ手順を確認してください。"
}

if (-not (Test-CommandExists "npm")) {
    Write-Error "npmが見つかりません。Node.jsのインストール状態を確認してください。"
}

if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules が見つからないため、依存パッケージをインストールします。"
    if (Test-Path "package-lock.json") {
        npm ci
    } else {
        npm install
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "依存パッケージのインストールに失敗しました。ネットワーク接続とnpmのエラーメッセージを確認してください。"
    }
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "PDF生成に失敗しました。上のエラーメッセージを確認してください。"
}

Write-Host ""
Write-Host "PDF生成が完了しました。出力先は document.config.json の output を確認してください。"
