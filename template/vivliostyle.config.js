// ビルド対象の文書は環境変数 DOC_CONFIG(文書名)で指定される
// (scripts/build-document.js と同じ規則で documents/<文書名>/ に解決)。
const fs = require('node:fs');
const path = require('node:path');
const { resolveDocConfig } = require('./scripts/resolve-config');
const documentConfig = require(resolveDocConfig(__dirname));

// 利用者の見た目調整用CSS。"styles" の指定の有無にかかわらず常に最後に読み込む。
// キットのアップデートで document.css やテーマを上書きしても、このファイルの
// 変更は残る(manuals/UPDATE.md 参照)。ファイルが無ければ何もしない。
const CUSTOM_STYLE = 'styles/custom.css';
function withCustomStyle(styles) {
  const list = Array.isArray(styles) ? styles : [styles];
  if (list.includes(CUSTOM_STYLE) || !fs.existsSync(path.join(__dirname, CUSTOM_STYLE))) {
    return list;
  }
  return [...list, CUSTOM_STYLE];
}

module.exports = {
  title: documentConfig.title,
  author: documentConfig.author,
  language: documentConfig.language,
  size: documentConfig.size,
  entry: ['.vivliostyle/generated/document-bundle.md'],
  // 組版に使うCSS。document.config.json の "styles" で差し替えられる
  theme: withCustomStyle(documentConfig.styles ?? ['styles/document.css']),
  output: [documentConfig.output],
  workspaceDir: '.vivliostyle/workspace',
  // 生成したMermaid SVGは隠しフォルダ(.vivliostyle/)配下にあるため、
  // 既定のアセットコピーから漏れる。明示的に含める。
  // fonts/ は@font-face(document.config.jsonの"fonts"指定)から参照される。
  copyAsset: {
    includes: ['.vivliostyle/generated/diagrams/**/*.svg', 'fonts/**/*'],
  },
};
