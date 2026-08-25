// 生成済みPDFに入力可能なフォームフィールド(AcroForm)を追加する後処理。
//
// 原稿に <a class="pdf-field" href="pdf-field://名前"></a> と書いたセルは、
// Chromiumの印刷時にリンク注釈(位置矩形付き)としてPDFに残る。
// このスクリプトはその注釈を見つけて削除し、同じ位置にテキスト入力
// フィールドを重ねる。座標計算をしないため、表の列数やレイアウトを
// 変えてもズレない。
//
// マーカーが1つも無ければ何もしない(通常のビルドに影響なし)。
const fs = require('node:fs');
const path = require('node:path');
const {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFArray,
  PDFString,
  PDFHexString,
  PDFBool,
  TextAlignment,
} = require('pdf-lib');

// 対象PDF: 引数で指定するか、未指定なら環境変数 DOC_CONFIG(文書名)の
// 設定ファイル(documents/<文書名>/document.config.json)の output を使う。
//   node scripts/add-form-fields.js [PDFファイル]
const { resolveDocConfig } = require('./resolve-config');
const root = process.cwd();
const pdfPath = process.argv[2]
  ? path.resolve(root, process.argv[2])
  : path.join(root, require(resolveDocConfig(root)).output);

const MARKER = 'pdf-field://';

function annotationUri(annot) {
  const action = annot.lookup(PDFName.of('A'));
  if (!(action instanceof PDFDict)) {
    return null;
  }
  const uri = action.lookup(PDFName.of('URI'));
  if (uri instanceof PDFString || uri instanceof PDFHexString) {
    return uri.decodeText();
  }
  return null;
}

async function main() {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath));
  const markers = [];

  doc.getPages().forEach((page, pageIndex) => {
    const annots = page.node.lookup(PDFName.of('Annots'));
    if (!(annots instanceof PDFArray)) {
      return;
    }
    const kept = [];
    for (let i = 0; i < annots.size(); i += 1) {
      const annot = annots.lookup(i);
      const uri = annot instanceof PDFDict ? annotationUri(annot) : null;
      const markerAt = uri ? uri.indexOf(MARKER) : -1;
      if (markerAt === -1) {
        kept.push(annots.get(i));
        continue;
      }
      // リンクのhrefはビルド時にベースURLが前置されることがあるため、
      // "pdf-field://" 以降だけをフィールド名として取り出す
      const name = decodeURIComponent(uri.slice(markerAt + MARKER.length)).replace(/\/+$/, '');
      if (name === '') {
        throw new Error('pdf-field:// リンクにフィールド名がありません。例: href="pdf-field://author"');
      }
      const rect = annot
        .lookup(PDFName.of('Rect'))
        .asArray()
        .map((value) => value.asNumber());
      markers.push({ pageIndex, name, rect });
    }
    if (kept.length !== annots.size()) {
      page.node.set(PDFName.of('Annots'), doc.context.obj(kept));
    }
  });

  if (markers.length === 0) {
    console.log('No pdf-field markers found; PDF left unchanged.');
    return;
  }

  const form = doc.getForm();
  const fields = new Map();
  for (const marker of markers) {
    // 同じ名前のマーカーは同じフィールドを共有する(片方に入力すると
    // もう片方にも同じ値が表示される)
    let field = fields.get(marker.name);
    if (!field) {
      field = form.createTextField(marker.name);
      // セル幅(30mm前後)に日付などが収まるよう、本文より少し小さめにする
      field.acroField.setDefaultAppearance('/Helv 9 Tf 0 g');
      // 表のセルに合わせて中央揃え
      field.setAlignment(TextAlignment.Center);
      fields.set(marker.name, field);
    }
    const [x1, y1, x2, y2] = marker.rect;
    field.addToPage(doc.getPage(marker.pageIndex), {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      borderWidth: 0,
    });
  }

  // フォントを埋め込まない代わりに、閲覧ソフト側で見た目を描画させる。
  // これで日本語の入力もAcrobat/Edge/Chromeで正しく表示される
  form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.True);

  fs.writeFileSync(pdfPath, await doc.save());
  console.log(
    `Added ${fields.size} form field(s) to ${path.relative(root, pdfPath)}: ${[...fields.keys()].join(', ')}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
