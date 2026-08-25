// ビルド対象の文書は環境変数 DOC_CONFIG(文書名)で指定される
// (scripts/build-document.js と同じ規則で documents/<文書名>/ に解決)。
const { resolveDocConfig } = require('./scripts/resolve-config');
const documentConfig = require(resolveDocConfig(__dirname));

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
