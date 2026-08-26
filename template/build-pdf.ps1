# 使い方: .\build-pdf.ps1 <文書名>  または  .\build-pdf.ps1 -All
#   文書名 → 文書フォルダ(既定 documents/)配下の <文書名>/document.config.json でビルドする
#   -All   → 文書フォルダ配下のすべての文書を順番にビルドする
#   例: .\build-pdf.ps1 project-document
# 文書フォルダの場所は kit.config.json の "documentsDir" で変更できる。
param(
    [Parameter(Position = 0)]
    [string]$Document,
    [switch]$All
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Test-CommandExists {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

if ($All -and $Document) {
    Write-Error "-All と文書名は同時に指定できません。"
}

if (-not (Test-CommandExists "node")) {
    Write-Error "Node.jsが見つかりません。初回セットアップ手順を確認してください。"
}

if (-not (Test-CommandExists "npm")) {
    Write-Error "npmが見つかりません。Node.jsのインストール状態を確認してください。"
}

# 文書フォルダのルート(kit.config.json の documentsDir、既定 documents)
$DocumentsDir = node scripts/print-documents-dir.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "文書フォルダの設定の読み込みに失敗しました。上のエラーメッセージを確認してください。"
}

function Get-DocumentListText {
    if (Test-Path $DocumentsDir) {
        # サブフォルダも含めて document.config.json を持つフォルダを文書として表示する
        $base = (Get-Item $DocumentsDir).FullName
        $names = Get-ChildItem $DocumentsDir -Recurse -Filter "document.config.json" -File |
            ForEach-Object { "  - " + ($_.Directory.FullName.Substring($base.Length + 1) -replace '\\', '/') } |
            Sort-Object
        return "$DocumentsDir/ にある文書:`n" + ($names -join "`n")
    }
    return "$DocumentsDir/ フォルダがまだありません。$DocumentsDir/<文書名>/document.config.json を作成してください。"
}

if (-not $All -and -not $Document) {
    Write-Error ("ビルドする文書を指定してください。`n使い方: .\build-pdf.ps1 <文書名>  または  .\build-pdf.ps1 -All`n" + (Get-DocumentListText))
}

if ($Document -and -not (Test-Path "$DocumentsDir/$Document/document.config.json" -PathType Leaf)) {
    Write-Error ("文書 '$Document' が見つかりません($DocumentsDir/$Document/document.config.json がありません)。`n" + (Get-DocumentListText))
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

if ($All) {
    # 一括ビルドの前に文書一覧を取得し、output の重複などを検証する
    $documents = @(node scripts/list-documents.js)
    if ($LASTEXITCODE -ne 0) {
        Write-Error "文書一覧の取得に失敗しました。上のエラーメッセージを確認してください。"
    }
} else {
    $documents = @($Document)
}

# 環境変数 DOC_CONFIG で文書名をビルドスクリプト群に伝える。
# 呼び出し元のセッションに残らないよう、終了時に元の値へ戻す
$previousConfig = $env:DOC_CONFIG
try {
    foreach ($name in $documents) {
        Write-Host "Vivliostyle PDF文書の生成を開始します。(文書: $name)"
        $env:DOC_CONFIG = $name
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "PDF生成に失敗しました。(文書: $name)上のエラーメッセージを確認してください。"
        }
    }
} finally {
    if ($null -eq $previousConfig) {
        Remove-Item Env:DOC_CONFIG -ErrorAction SilentlyContinue
    } else {
        $env:DOC_CONFIG = $previousConfig
    }
}

Write-Host ""
if ($All) {
    Write-Host "全文書のPDF生成が完了しました:"
    $documents | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "PDF生成が完了しました。出力先は $DocumentsDir/$Document/document.config.json の output を確認してください。"
}
