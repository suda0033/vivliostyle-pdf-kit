<section class="chapter">

# 受注ファイル取込

## 機能概要

受注ファイル取込機能は、EC サイトから出力された CSV ファイルを読み込み、システム内部の受注データへ変換する機能である。

## 使用ファイル

| ファイル ID | ファイル名 | 形式 | 文字コード | 改行 | 配置場所 |
| --- | --- | --- | --- | --- | --- |
| F-ORDER-IN | `order_yyyyMMdd_HHmmss.csv` | CSV | UTF-8 | CRLF | `/data/inbound/order/` |
| F-ORDER-ARCHIVE | `order_yyyyMMdd_HHmmss.csv` | CSV | UTF-8 | CRLF | `/data/archive/order/` |
| F-ORDER-ERROR | `order_error_yyyyMMdd_HHmmss.csv` | CSV | UTF-8 | CRLF | `/data/outbound/error/` |

## 入力レイアウト

| No | 項目名 | 必須 | 型 | 桁数 | 説明 |
| --- | --- | --- | --- | --- | --- |
| 1 | order_id | 必須 | 文字列 | 32 | EC 側受注番号 |
| 2 | ordered_at | 必須 | 日時 | 19 | `yyyy-MM-dd HH:mm:ss` |
| 3 | customer_id | 必須 | 文字列 | 20 | 顧客 ID |
| 4 | sku | 必須 | 文字列 | 30 | 商品 SKU |
| 5 | quantity | 必須 | 数値 | 5 | 注文数量 |
| 6 | delivery_zip | 必須 | 文字列 | 8 | 配送先郵便番号 |
| 7 | delivery_address | 必須 | 文字列 | 200 | 配送先住所 |

## 処理仕様

### ファイル検出

1. 入力フォルダから `order_*.csv` に一致するファイルを取得する。
2. ファイル名の日時部分が処理日時として解釈できるか確認する。
3. 複数ファイルが存在する場合は、ファイル名の日時昇順に処理する。

### 入力チェック

| チェック | 条件 | エラーコード |
| --- | --- | --- |
| ヘッダー | 定義済み項目と完全一致すること | E001 |
| 必須 | 必須項目が空でないこと | E002 |
| 型 | 日時、数値が変換可能であること | E003 |
| 数量 | `quantity` が 1 以上であること | E004 |
| 重複 | `order_id` と `sku` の組み合わせが重複しないこと | E005 |

### 正規化

入力 CSV の値を内部形式へ変換する。

| 入力 | 変換後 | 変換内容 |
| --- | --- | --- |
| ordered_at | orderedAt | ISO 8601 形式へ変換 |
| sku | productCode | 商品マスタの SKU から内部商品コードへ変換 |
| quantity | orderQuantity | 数値型へ変換 |
| delivery_zip | deliveryZip | ハイフンを除去 |

## アクセスするデータ

| データ名 | アクセス | 条件 | 用途 |
| --- | --- | --- | --- |
| 商品マスタ | 参照 | SKU が一致、有効期間内 | 商品コード、販売可否、温度帯の取得 |
| 受注テーブル | 登録 | 取込対象明細 | 正常受注の保存 |
| 受注取込エラーテーブル | 登録 | チェックエラー明細 | エラー理由の保存 |
| バッチ実行履歴 | 登録、更新 | 実行 ID | 処理開始、終了、件数の記録 |

</section>
