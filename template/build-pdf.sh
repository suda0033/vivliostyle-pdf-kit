#!/bin/sh
# 使い方: ./build-pdf.sh <文書名>|--all
#   文書名  → 文書フォルダ(既定 documents/)配下の <文書名>/document.config.json でビルドする
#   --all   → 文書フォルダ配下のすべての文書を順番にビルドする
#   例: ./build-pdf.sh project-document
# 文書フォルダの場所は kit.config.json の "documentsDir" で変更できる。
set -eu

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
    echo "エラー: Node.jsが見つかりません。初回セットアップ手順を確認してください。" >&2
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "エラー: npmが見つかりません。Node.jsのインストール状態を確認してください。" >&2
    exit 1
fi

# 文書フォルダのルート(kit.config.json の documentsDir、既定 documents)
docdir=$(node scripts/print-documents-dir.js)

show_documents() {
    if [ -d "$docdir" ]; then
        echo "$docdir/ にある文書:" >&2
        # サブフォルダも含めて document.config.json を持つフォルダを文書として表示する
        find "$docdir" -name document.config.json | sort | while IFS= read -r cfg; do
            dir=${cfg%/document.config.json}
            echo "  - ${dir#"$docdir"/}" >&2
        done
    else
        echo "$docdir/ フォルダがまだありません。$docdir/<文書名>/document.config.json を作成してください。" >&2
    fi
}

arg="${1:-}"
build_all=false
case "$arg" in
    --all)
        build_all=true
        ;;
    "")
        echo "エラー: ビルドする文書を指定してください。" >&2
        echo "使い方: ./build-pdf.sh <文書名>  または  ./build-pdf.sh --all" >&2
        show_documents
        exit 1
        ;;
    *)
        if [ ! -f "$docdir/$arg/document.config.json" ]; then
            echo "エラー: 文書 '$arg' が見つかりません($docdir/$arg/document.config.json がありません)。" >&2
            show_documents
            exit 1
        fi
        ;;
esac

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

build_one() {
    echo "Vivliostyle PDF文書の生成を開始します。(文書: $1)"
    DOC_CONFIG="$1" npm run build
}

if [ "$build_all" = true ]; then
    # 一括ビルドの前に文書一覧を取得し、output の重複などを検証する
    names=$(node scripts/list-documents.js)
    for name in $names; do
        build_one "$name"
    done
    echo ""
    echo "全文書のPDF生成が完了しました:"
    echo "$names" | sed 's/^/  - /'
else
    build_one "$arg"
    echo ""
    echo "PDF生成が完了しました。出力先は $docdir/$arg/document.config.json の output を確認してください。"
fi
