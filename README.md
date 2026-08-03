# Vivliostyle PDF Kit

Markdown原稿を[Vivliostyle](https://vivliostyle.org/)でPDF化するための、コピーして使えるキットです。

## 使い方

**このリポジトリの提供物は `template/` フォルダです。** 利用するプロジェクトに `template/` をフォルダごとコピーするだけで、自己完結した文書作成環境として使えます。フォルダ名は `docs` など自由に変えて構いません。

[Releases](https://github.com/suda0033/vivliostyle-pdf-kit/releases) から `template.zip` をダウンロードして展開しても、同じものが手に入ります。

セットアップとPDF生成の手順は [template/README.md](template/README.md) を参照してください。

```
template/
├── README.md            # 利用手順
├── setup-docs.ps1       # 初回セットアップ(Windows / PowerShell)
├── build-pdf.ps1        # PDF生成(Windows / PowerShell)
├── setup-docs.sh        # 初回セットアップ(Linux・Mac / シェル)
├── build-pdf.sh         # PDF生成(Linux・Mac / シェル)
├── document.config.json # 文書タイトル、出力先、結合順
├── manuscript/          # Markdown原稿
├── assets/              # 画像
├── styles/document.css  # PDFの見た目
└── scripts/             # ビルドスクリプト
```

前提: Node.js 22.12以降(最新LTS推奨)。Windowsでは `.ps1`(PowerShell)、Linux・Macでは `.sh` のスクリプトを使います。

## 開発用フォルダ(`dev/`)

`dev/` はこのキット自体の検証・サンプル用です。キットの利用者はコピー不要です。

| フォルダ | 内容 |
| --- | --- |
| `dev/samples/` | 検証用サンプル原稿(単一文書、機能仕様書) |
| `dev/slides/` | Vivliostyleで作るスライドのサンプル |
| `dev/styles/` | サンプル用CSS |
| `dev/scripts/` | サンプル(機能仕様書)のビルドスクリプト |
| `dev/dist/` | 生成済みサンプルPDF |
| `dev/guides/` | Vivliostyle利用メモ |
| `dev/plan/` | 検証計画 |

サンプルのビルドは `dev/` で `npm install` 後、`npm run build`(単一文書)、`npm run spec`(機能仕様書)、`npm run header`(ページヘッダーに表を入れるサンプル)、`npm run slides:build`(スライド)を実行します。

## CI / Release

- push・Pull Request時に、GitHub Actionsのubuntuランナーで `template/` のセットアップとPDF生成を検証します([.github/workflows/ci.yml](.github/workflows/ci.yml))。
- `v` で始まるタグ(例: `v1.0.0`)をpushすると、`template.zip` を添付したReleaseが自動作成されます([.github/workflows/release.yml](.github/workflows/release.yml))。
