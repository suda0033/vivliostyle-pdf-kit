// 文書フォルダ配下の文書名を列挙し、1行1名で出力する(build-pdf の一括ビルド用)。
// 文書フォルダのルートは既定で documents/、kit.config.json の "documentsDir" で変更できる。
// 列挙と同時に、各文書の "output" が空でないこと・文書間で重複しないことを検証する
// (重複したまま一括ビルドすると、後の文書が前の文書のPDFを上書きしてしまうため)。
const fs = require('node:fs');
const path = require('node:path');
const { getDocumentsDir } = require('./resolve-config');

const root = process.cwd();

let documentsDirName;
try {
  documentsDirName = getDocumentsDir(root);
} catch (error) {
  console.error(`エラー: ${error.message}`);
  process.exit(1);
}
const documentsDir = path.join(root, documentsDirName);

if (!fs.existsSync(documentsDir)) {
  console.error(`エラー: ${documentsDirName}/ フォルダがありません。${documentsDirName}/<文書名>/document.config.json を作成してください。`);
  process.exit(1);
}

const names = fs.readdirSync(documentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(documentsDir, name, 'document.config.json')))
  .sort();

if (names.length === 0) {
  console.error(`エラー: ${documentsDirName}/ に文書がありません(${documentsDirName}/<文書名>/document.config.json が見つかりません)。`);
  process.exit(1);
}

const outputs = new Map();
for (const name of names) {
  const configFile = `${documentsDirName}/${name}/document.config.json`;
  const config = require(path.join(documentsDir, name, 'document.config.json'));
  if (typeof config.output !== 'string' || config.output.trim() === '') {
    console.error(`エラー: ${configFile} の "output" に出力PDFのパスを文字列で指定してください。例: "dist/${name}.pdf"`);
    process.exit(1);
  }
  const key = path.normalize(config.output).toLowerCase();
  if (outputs.has(key)) {
    console.error(`エラー: 出力先が重複しています: ${config.output}(文書 '${outputs.get(key)}' と '${name}')。文書ごとに別の "output" を指定してください。`);
    process.exit(1);
  }
  outputs.set(key, name);
}

console.log(names.join('\n'));
