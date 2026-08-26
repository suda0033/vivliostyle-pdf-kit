// 文書フォルダのルート(kit.config.json の documentsDir、既定 documents)を
// 解決して表示する。build-pdf.ps1 / build-pdf.sh が引数チェックに使う。
const { getDocumentsDir } = require('./resolve-config');

try {
  console.log(getDocumentsDir(process.cwd()));
} catch (error) {
  console.error(`エラー: ${error.message}`);
  process.exit(1);
}
