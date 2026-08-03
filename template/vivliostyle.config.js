const documentConfig = require('./document.config.json');

module.exports = {
  title: documentConfig.title,
  author: documentConfig.author,
  language: documentConfig.language,
  size: documentConfig.size,
  entry: ['.vivliostyle/generated/document-bundle.md'],
  theme: ['styles/document.css'],
  output: [documentConfig.output],
  workspaceDir: '.vivliostyle/workspace',
  // 生成したMermaid SVGは隠しフォルダ(.vivliostyle/)配下にあるため、
  // 既定のアセットコピーから漏れる。明示的に含める。
  copyAsset: {
    includes: ['.vivliostyle/generated/diagrams/**/*.svg'],
  },
};
