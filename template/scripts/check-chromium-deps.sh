#!/bin/sh
# PDF生成に使うChromium(Chrome for Testing)が必要とする共有ライブラリを確認するスクリプト。
# 最小構成のLinuxではlibnss3などが入っておらず、Chromiumが起動できないことがある。
#
# 使い方:
#   sh scripts/check-chromium-deps.sh            # 確認のみ。不足があればexit 1
#   sh scripts/check-chromium-deps.sh --install  # Debian/Ubuntu系なら不足パッケージのインストールも試みる
#
# Linux以外のOSでは何もせず正常終了する。
set -eu

[ "$(uname -s)" = "Linux" ] || exit 0

MODE="check"
[ "${1:-}" = "--install" ] && MODE="install"

# musl系(Alpine等)では、自動ダウンロードされるChrome(glibcビルド)がそもそも動かない
if [ -f /etc/alpine-release ]; then
    echo "エラー: Alpine等のmusl系Linuxでは、自動ダウンロードされるChromeが動作しません。" >&2
    echo "Debian/Ubuntuなどglibc系のディストリビューションで実行してください。" >&2
    exit 1
fi

# ARM64 Linuxには公式Chromeバイナリがなく、Vivliostyleはシステムの /usr/bin/chromium を使う
if [ "$(uname -m)" = "aarch64" ]; then
    if [ -x /usr/bin/chromium ]; then
        echo "ARM64 Linuxのため、システムのChromium(/usr/bin/chromium)を使用します。"
        exit 0
    fi
    echo "エラー: ARM64 Linuxでは公式Chromeバイナリが提供されないため、システムのChromiumが必要です。" >&2
    echo "ディストリビューションのパッケージ(例: sudo apt-get install chromium)をインストールしてください。" >&2
    exit 1
fi

# Vivliostyle CLIは初回ビルド時にChromiumをzipでダウンロードして展開するため、
# unzipコマンドが必要(最小構成のLinuxには入っていないことがある)
NEED_UNZIP=0
command -v unzip >/dev/null 2>&1 || NEED_UNZIP=1

if ! command -v ldd >/dev/null 2>&1; then
    echo "警告: lddコマンドが無いため、Chromiumの依存ライブラリ確認をスキップします。"
    exit 0
fi

# Chromeバイナリの場所。mermaid-cli(puppeteer)はnpmインストール時に、
# Vivliostyle CLIは初回ビルド時にそれぞれのキャッシュへダウンロードする。
# どちらも同じChrome for Testingビルドで、必要な共有ライブラリは共通。
find_chrome_binary() {
    for dir in \
        "${PUPPETEER_CACHE_DIR:-$HOME/.cache/puppeteer}" \
        "${XDG_CACHE_HOME:-$HOME/.cache}/vivliostyle/browsers" \
        /opt/puppeteer; do
        [ -d "$dir" ] || continue
        found=$(find "$dir" -type f -name chrome -path '*chrome-linux*' 2>/dev/null | head -n 1)
        if [ -n "$found" ]; then
            printf '%s\n' "$found"
            return 0
        fi
    done
    return 1
}

CHROME_BIN=""
if ! CHROME_BIN=$(find_chrome_binary); then
    echo "Chromiumが未ダウンロードのため、依存ライブラリの確認をスキップします(初回ビルド時に自動ダウンロードされます)。"
fi

list_missing_libs() {
    if [ -z "$CHROME_BIN" ]; then
        return 0
    fi
    ldd "$CHROME_BIN" 2>/dev/null | awk '/not found/ {print $1}' | sort -u
}

MISSING=$(list_missing_libs)
if [ -z "$MISSING" ] && [ "$NEED_UNZIP" = "0" ]; then
    echo "Chromiumの実行に必要なコマンドとライブラリは揃っています。"
    exit 0
fi

if [ -n "$MISSING" ]; then
    echo "Chromiumの起動に必要な共有ライブラリが不足しています:"
    echo "$MISSING" | sed 's/^/  - /'
fi
if [ "$NEED_UNZIP" = "1" ]; then
    echo "Chromiumのダウンロード展開に必要なunzipコマンドが見つかりません。"
fi

if ! command -v apt-get >/dev/null 2>&1; then
    echo "" >&2
    echo "このディストリビューションでは自動インストールに対応していません(Debian/Ubuntu系のみ対応)。" >&2
    echo "不足しているコマンド・ライブラリを、お使いのパッケージマネージャでインストールしてください。" >&2
    echo "例(Fedora/RHEL系): sudo dnf install -y unzip nss nspr atk at-spi2-atk cups-libs libdrm mesa-libgbm alsa-lib pango cairo libXcomposite libXdamage libXrandr libxkbcommon" >&2
    exit 1
fi

# Debian/Ubuntu系のChrome前提パッケージ。"|" 区切りは別名候補で、
# 存在が確認できた最初の名前を使う(Ubuntu 24.04以降のt64パッケージ名対応)。
APT_PACKAGES="
ca-certificates
libasound2t64|libasound2
libatk-bridge2.0-0t64|libatk-bridge2.0-0
libatk1.0-0t64|libatk1.0-0
libatspi2.0-0t64|libatspi2.0-0
libcairo2
libcups2t64|libcups2
libdbus-1-3
libdrm2
libexpat1
libfontconfig1
libgbm1
libglib2.0-0t64|libglib2.0-0
libnspr4
libnss3
libpango-1.0-0
libpangocairo-1.0-0
libstdc++6
libudev1
libx11-6
libx11-xcb1
libxcb1
libxcomposite1
libxdamage1
libxext6
libxfixes3
libxkbcommon0
libxrandr2
libxrender1
libxss1
libxtst6
"

resolve_apt_package() {
    for candidate in $(printf '%s' "$1" | tr '|' ' '); do
        if apt-cache show "$candidate" >/dev/null 2>&1; then
            printf '%s' "$candidate"
            return 0
        fi
    done
    # apt-get update前などで解決できない場合は先頭の候補を使う
    printf '%s' "${1%%|*}"
}

# インストール対象: ライブラリ不足時はChrome前提パッケージ一式、unzip不足時はunzip
build_package_list() {
    PKGS=""
    if [ -n "$MISSING" ]; then
        for group in $APT_PACKAGES; do
            PKGS="$PKGS $(resolve_apt_package "$group")"
        done
    fi
    if [ "$NEED_UNZIP" = "1" ]; then
        PKGS="$PKGS unzip"
    fi
}

if [ "$MODE" = "check" ]; then
    echo "" >&2
    echo "./setup-docs.sh を再実行するか、次のコマンドでインストールしてください:" >&2
    build_package_list
    echo "  sudo apt-get update && sudo apt-get install -y --no-install-recommends$PKGS" >&2
    exit 1
fi

# --install モード: root なら直接、そうでなければ sudo で apt-get を実行する
if [ "$(id -u)" = "0" ]; then
    SUDO=""
elif command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
    echo "パッケージのインストールに管理者権限が必要です。sudoのパスワードを求められることがあります。"
else
    echo "" >&2
    echo "エラー: root権限がなくsudoも見つからないため、自動インストールできません。" >&2
    echo "管理者に依頼して次のコマンドを実行してください:" >&2
    echo "  apt-get update && apt-get install -y --no-install-recommends libnss3 (ほか上記の不足ライブラリを含むパッケージ)" >&2
    exit 1
fi

echo "不足パッケージをインストールします(Debian/Ubuntu系)。"
$SUDO apt-get update
build_package_list
# shellcheck disable=SC2086
$SUDO apt-get install -y --no-install-recommends $PKGS

MISSING=$(list_missing_libs)
if [ -n "$MISSING" ]; then
    echo "" >&2
    echo "エラー: インストール後も次のライブラリが不足しています:" >&2
    echo "$MISSING" | sed 's/^/  - /' >&2
    echo "お使いのディストリビューションで上記ライブラリを含むパッケージを個別にインストールしてください。" >&2
    exit 1
fi
if ! command -v unzip >/dev/null 2>&1; then
    echo "エラー: unzipのインストールに失敗しました。手動でインストールしてください。" >&2
    exit 1
fi

echo "Chromiumの実行に必要なコマンドとライブラリの準備が完了しました。"
