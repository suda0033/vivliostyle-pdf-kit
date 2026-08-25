const fs = require('node:fs');
const path = require('node:path');

// 環境変数 DOC_CONFIG(文書名)から設定ファイルの絶対パスを解決する。
// 文書は documents/<文書名>/ フォルダに置き、設定はその中の document.config.json。
// build-pdf.ps1 / build-pdf.sh も同じ規則で文書名を解決する。
function resolveDocConfig(baseDir) {
  const name = (process.env.DOC_CONFIG || '').trim();
  if (name === '') {
    throw new Error(
      'ビルドする文書が指定されていません。build-pdf.ps1 <文書名> / build-pdf.sh <文書名> を使うか、環境変数 DOC_CONFIG に documents/ の文書名を設定してください。',
    );
  }
  const configPath = path.resolve(baseDir, 'documents', name, 'document.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`文書 '${name}' が見つかりません(documents/${name}/document.config.json がありません)。`);
  }
  return configPath;
}

module.exports = { resolveDocConfig };
