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

// 文書名の検証。スペース(半角・全角・タブ)入りの名前は build-pdf.sh の
// 一括ビルドで正しく扱えないため、どの経路でも一律にエラーにする。
// 文書名はサブフォルダ区切り(例: "team-a/report")を含められるが、
// ".." などで文書フォルダの外に出ることはできない。
function assertValidDocumentName(name, documentsDir) {
  if (/[ \t　]/.test(name)) {
    const suggestion = name.replace(/[ \t　]+/g, '-');
    throw new Error(
      `文書フォルダ名 '${name}' にはスペースを使えません。'${documentsDir}/${suggestion}' のようにスペースなしの名前に変更してください。`,
    );
  }
  const segments = name.split(/[\\/]/);
  if (path.isAbsolute(name) || segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new Error(
      `文書名 '${name}' は不正です。${documentsDir}/ からの相対パスで、'..' を含まない名前を指定してください。例: "team-a/report"`,
    );
  }
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
  assertValidDocumentName(name, documentsDir);
  // 文書フォルダの中に別の文書は置けない(一括ビルドの探索規則と揃える)
  const segments = name.split(/[\\/]/);
  for (let i = 1; i < segments.length; i += 1) {
    const ancestor = segments.slice(0, i).join('/');
    if (fs.existsSync(path.resolve(baseDir, documentsDir, ancestor, 'document.config.json'))) {
      throw new Error(`文書 '${name}' は文書 '${ancestor}' の中にあります。文書フォルダの中に別の文書は置けません。`);
    }
  }
  const configPath = path.resolve(baseDir, documentsDir, name, 'document.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`文書 '${name}' が見つかりません(${documentsDir}/${name}/document.config.json がありません)。`);
  }
  return configPath;
}

module.exports = { getDocumentsDir, resolveDocConfig, assertValidDocumentName };
