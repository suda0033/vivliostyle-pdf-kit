const path = require('node:path');

// 設定ファイルは既定で document.config.json。環境変数 DOC_CONFIG で切り替え可能
// (scripts/build-document.js と同じ規則)。
const documentConfig = require(path.resolve(__dirname, process.env.DOC_CONFIG || 'document.config.json'));

module.exports = {
  title: documentConfig.title,
  author: documentConfig.author,
  language: documentConfig.language,
  size: documentConfig.size,
  entry: ['.vivliostyle/generated/document-bundle.md'],
  // 組版に使うCSS。document.config.json の "styles" で差し替えられる
  theme: documentConfig.styles ?? ['styles/document.css'],
  output: [documentConfig.output],
  workspaceDir: '.vivliostyle/workspace',
  // 生成したMermaid SVGは隠しフォルダ(.vivliostyle/)配下にあるため、
  // 既定のアセットコピーから漏れる。明示的に含める。
  // fonts/ は@font-face(document.config.jsonの"fonts"指定)から参照される。
  copyAsset: {
    includes: ['.vivliostyle/generated/diagrams/**/*.svg', 'fonts/**/*'],
  },
};
