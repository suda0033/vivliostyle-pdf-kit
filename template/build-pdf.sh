#!/bin/sh
# 使い方: ./build-pdf.sh [設定ファイル]
#   設定ファイルを省略すると document.config.json を使う。
#   samples/ のサンプルなど別の設定で生成する場合に指定する。
#   例: ./build-pdf.sh samples/doc-info-header/document.config.json
set -eu

cd "$(dirname "$0")"

config="${1:-document.config.json}"
if [ ! -f "$config" ]; then
    echo "エラー: 設定ファイルが見つかりません: $config" >&2
    exit 1
fi

echo "Vivliostyle PDF文書の生成を開始します。(設定: $config)"

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

# Chromiumの前提ライブラリが不足しているとビルドが分かりにくいエラーで失敗するため、
# 事前に確認する(Linuxのみ。不足時は対処方法を表示して終了する)
sh scripts/check-chromium-deps.sh

DOC_CONFIG="$config" npm run build

echo ""
echo "PDF生成が完了しました。出力先は $config の output を確認してください。"
