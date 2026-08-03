<section class="chapter">

# データ・ファイル仕様

## ディレクトリ構成

| パス | 用途 | 保持期間 |
| --- | --- | --- |
| `/data/inbound/order/` | 受注 CSV 入力 | 処理完了まで |
| `/data/archive/order/` | 正常処理済み受注 CSV 保管 | 90 日 |
| `/data/outbound/shipment/` | 出荷指示 CSV 出力 | 30 日 |
| `/data/outbound/error/` | エラー CSV 出力 | 90 日 |
| `/data/outbound/summary/` | 処理サマリー JSON 出力 | 90 日 |
| `/data/logs/batch/` | バッチログ | 180 日 |

## テーブル一覧

| テーブル名 | 種別 | 主な用途 |
| --- | --- | --- |
| admin_users | マスタ | 管理者認証 |
| products | マスタ | SKU と商品情報の解決 |
| stocks | トランザクション | 在庫数、引当数の管理 |
| orders | トランザクション | 受注データの保存 |
| order_import_errors | トランザクション | 取込エラー明細の保存 |
| allocation_histories | 履歴 | 在庫引当結果の監査 |
| batch_runs | 履歴 | バッチ実行状態の管理 |

## データアクセス方針

| 処理 | 参照 | 登録 | 更新 |
| --- | --- | --- | --- |
| 管理者ログイン | admin_users | operation_logs | login_failures |
| 受注ファイル取込 | products | orders, order_import_errors, batch_runs | batch_runs |
| 在庫引当 | orders, products, stocks | allocation_histories | orders, stocks |
| 処理結果出力 | orders, order_import_errors, sequences | なし | orders, sequences, batch_runs |

## エラーコード一覧

| コード | メッセージ | 発生箇所 |
| --- | --- | --- |
| E001 | ヘッダー定義が不正です。 | 受注ファイル取込 |
| E002 | 必須項目が未入力です。 | 受注ファイル取込 |
| E003 | 項目の形式が不正です。 | 受注ファイル取込 |
| E004 | 注文数量が不正です。 | 受注ファイル取込 |
| E005 | 受注明細が重複しています。 | 受注ファイル取込 |
| E101 | 販売不可商品です。 | 在庫引当 |
| E102 | 在庫が不足しています。 | 在庫引当 |

</section>
