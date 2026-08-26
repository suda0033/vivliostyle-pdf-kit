const fs = require('node:fs');
const path = require('node:path');

// 文書フォルダのルート(既定 documents)。kit.config.json の "documentsDir" で
// テンプレートのフォルダ基準の別の場所(例: "docs/specs")に変更できる。
// アセット(fonts/ や styles/)のコピーがテンプレートのフォルダ基準のため、
// テンプレートの外("../" や絶対パス)は許可しない。
function getDocumentsDir(baseDir) {
  const kitConfigPath = path.join(baseDir, 'kit.config.json');
  let dir = 'documents';
  if (fs.existsSync(kitConfigPath)) {
    const kitConfig = require(kitConfigPath);
    if (kitConfig.documentsDir !== undefined) {
      if (typeof kitConfig.documentsDir !== 'string' || kitConfig.documentsDir.trim() === '') {
        throw new Error('kit.config.json の "documentsDir" は文書フォルダのパスを文字列で指定してください。例: "docs/specs"');
      }
      dir = kitConfig.documentsDir;
    }
  }
  const relative = path.relative(baseDir, path.resolve(baseDir, dir));
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('kit.config.json の "documentsDir" はテンプレートのフォルダ内のパスを指定してください(絶対パスや "../" は使えません)。');
  }
  return relative.split(path.sep).join('/');
}

// 環境変数 DOC_CONFIG(文書名)から設定ファイルの絶対パスを解決する。
// 文書は <documentsDir>/<文書名>/ フォルダに置き、設定はその中の document.config.json。
// build-pdf.ps1 / build-pdf.sh も同じ規則で文書名を解決する。
function resolveDocConfig(baseDir) {
  const name = (process.env.DOC_CONFIG || '').trim();
  if (name === '') {
    throw new Error(
      'ビルドする文書が指定されていません。build-pdf.ps1 <文書名> / build-pdf.sh <文書名> を使うか、環境変数 DOC_CONFIG に文書名を設定してください。',
    );
  }
  const documentsDir = getDocumentsDir(baseDir);
  const configPath = path.resolve(baseDir, documentsDir, name, 'document.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`文書 '${name}' が見つかりません(${documentsDir}/${name}/document.config.json がありません)。`);
  }
  return configPath;
}

module.exports = { getDocumentsDir, resolveDocConfig };
