#!/bin/sh
set -eu

cd "$(dirname "$0")"

echo "Vivliostyle PDF文書化環境のセットアップを開始します。"

if ! command -v node >/dev/null 2>&1; then
    echo "エラー: Node.jsが見つかりません。Node.js 22.12以降のLTS版をインストールしてから再実行してください。" >&2
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "エラー: npmが見つかりません。Node.jsのインストール状態を確認してください。" >&2
    exit 1
fi

echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

if [ -f "package-lock.json" ]; then
    echo "package-lock.json に基づいて依存パッケージをインストールします。"
    npm ci
else
    echo "依存パッケージをインストールします。初回実行後、package-lock.json が作成されます。"
    npm install
fi

echo ""
echo "セットアップが完了しました。PDFを生成するには次を実行してください。"
echo "./build-pdf.sh"
