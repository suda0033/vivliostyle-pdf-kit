# 使い方: .\build-pdf.ps1 [-Config 設定ファイル]
#   -Config を省略すると document.config.json を使う。
#   samples/ のサンプルなど別の設定で生成する場合に指定する。
#   例: .\build-pdf.ps1 -Config samples/doc-info-header/document.config.json
param(
    [string]$Config = "document.config.json"
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Test-Path $Config -PathType Leaf)) {
    Write-Error "設定ファイルが見つかりません: $Config"
}

function Test-CommandExists {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "Vivliostyle PDF文書の生成を開始します。(設定: $Config)"

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

# 環境変数 DOC_CONFIG で設定ファイルをビルドスクリプト群に伝える。
# 呼び出し元のセッションに残らないよう、終了時に元の値へ戻す
$previousConfig = $env:DOC_CONFIG
try {
    $env:DOC_CONFIG = $Config
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "PDF生成に失敗しました。上のエラーメッセージを確認してください。"
    }
} finally {
    if ($null -eq $previousConfig) {
        Remove-Item Env:DOC_CONFIG -ErrorAction SilentlyContinue
    } else {
        $env:DOC_CONFIG = $previousConfig
    }
}

Write-Host ""
Write-Host "PDF生成が完了しました。出力先は $Config の output を確認してください。"
