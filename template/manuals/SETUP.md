# 初回セットアップ

このフォルダを使い始めるとき、最初に1回だけ実行する手順です。2回目以降は [USAGE.md](USAGE.md) のPDF更新だけで足ります。

ターミナルで、`setup-docs.ps1` / `setup-docs.sh` があるフォルダ(このフォルダの1つ上、README.mdと同じ場所)へ移動して、次を実行します。

Windows(PowerShell):

```powershell
.\setup-docs.ps1
```

Linux・Mac:

```bash
./setup-docs.sh
```

`Permission denied` になる場合は `sh setup-docs.sh` を実行してください(Windowsでzipを展開してからコピーした場合など、経路によってスクリプトの実行権限が失われることがあります)。

## セットアップで行われること

Node.jsが入っていることを確認し、必要なnpmパッケージをインストールします。
Mermaid図のレンダリングにChromiumを含むパッケージを使うため、初回インストールはサイズが大きく(数百MB)、時間がかかることがあります。

Linuxでは、PDF生成に使うChromiumが必要とする共有ライブラリ(libnss3など)が揃っているかも確認します。最小構成のLinux(Dockerコンテナ等)で不足している場合、Debian/Ubuntu系では自動でインストールを試みます(sudoのパスワードを求められることがあります)。その他のディストリビューションでは不足ライブラリの一覧と対処方法を表示します。

また、Linuxでは `fonts/` のフォント(同梱のNoto Sans JP)をユーザーフォントとして登録します。これはMermaid図の文字化け対策です([OPTIONS.md](OPTIONS.md)の「フォントを指定する」を参照)。

## 前提

Node.js 22.12以降(最新LTS推奨)が必要です。
