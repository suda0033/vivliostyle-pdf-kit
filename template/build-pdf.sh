#!/bin/sh
set -eu

cd "$(dirname "$0")"

echo "Vivliostyle PDF文書の生成を開始します。"

if ! command -v node >/dev/null 2>&1; then
    echo "エラー: Node.jsが見つかりません。初回セットアップ手順を確認してください。" >&2
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "エラー: npmが見つかりません。Node.jsのインストール状態を確認してください。" >&2
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "node_modules が見つからないため、依存パッケージをインストールします。"
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
fi

npm run build

echo ""
echo "PDF生成が完了しました。出力先は document.config.json の output を確認してください。"
