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

# 最小構成のLinuxではChromiumの前提ライブラリが不足していることがあるため、
# 確認と(Debian/Ubuntu系なら)自動インストールを行う。Linux以外では何もしない。
sh scripts/check-chromium-deps.sh --install

# Linuxではfonts/に置いたフォントをユーザーフォントとして登録する。
# 文書本文はdocument.config.jsonの"fonts"指定(@font-face)で使えるが、
# Mermaid図の中の文字はシステムフォントを参照するため、登録しないと
# 日本語フォントの無い環境で文字化け(□)する。
if [ "$(uname -s)" = "Linux" ]; then
    FONT_DEST="${XDG_DATA_HOME:-$HOME/.local/share}/fonts/vivliostyle-docs"
    FONT_INSTALLED=0
    for font_file in fonts/*.ttf fonts/*.otf fonts/*.ttc; do
        if [ -f "$font_file" ]; then
            mkdir -p "$FONT_DEST"
            cp -f "$font_file" "$FONT_DEST/"
            FONT_INSTALLED=1
        fi
    done
    if [ "$FONT_INSTALLED" = "1" ]; then
        if command -v fc-cache >/dev/null 2>&1; then
            fc-cache -f "$FONT_DEST" >/dev/null 2>&1 || true
        fi
        echo "fonts/ のフォントをユーザーフォントとして登録しました: $FONT_DEST"
    elif command -v fc-list >/dev/null 2>&1 && [ -z "$(fc-list :lang=ja 2>/dev/null | head -n 1)" ]; then
        echo "警告: この環境に日本語フォントが見つかりません。PDFの日本語が□(豆腐)になる場合は、"
        echo "  - fonts/ に日本語フォント(.ttf/.otf)を置いて再実行する(document.config.jsonのfonts指定も参照)"
        echo "  - または日本語フォントをインストールする(例: sudo apt-get install -y fonts-noto-cjk)"
        echo "のいずれかを行ってください。"
    fi
fi

echo ""
echo "セットアップが完了しました。PDFを生成するには次を実行してください。"
echo "./build-pdf.sh"
