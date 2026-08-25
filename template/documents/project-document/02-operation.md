# PDF更新手順

## 初回セットアップ

ターミナルで文書フォルダへ移動し、次を実行します。

Windows(PowerShell):

```powershell
.\setup-docs.ps1
```

Linux・Mac:

```bash
./setup-docs.sh
```

## PDF生成

Markdownを編集した後、次を実行します。

Windows(PowerShell):

```powershell
.\build-pdf.ps1
```

Linux・Mac:

```bash
./build-pdf.sh
```

## 確認項目

| 項目 | 確認内容 |
| --- | --- |
| 目次 | 見出しとページ番号が合っているか |
| 章番号 | 番号が飛んでいないか |
| 表 | 横幅に収まっているか |
| 図 | 読める大きさで表示されているか |

<div class="note">

PDFを直接編集せず、MarkdownやCSSを更新してから再生成します。

</div>
