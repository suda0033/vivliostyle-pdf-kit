const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
// ビルド対象の文書は環境変数 DOC_CONFIG(文書名)で指定され、
// documents/<文書名>/document.config.json が設定ファイルになる
// (build-pdf.ps1 / build-pdf.sh の第1引数と同じ規則)。
const { resolveDocConfig } = require('./resolve-config');
const configPath = resolveDocConfig(root);
const configName = path.relative(root, configPath).split(path.sep).join('/');
const config = require(configPath);

// "styles": 組版に使うCSSの一覧(任意。未指定なら styles/document.css のみ)。
// vivliostyle.config.js が theme として読む。ここでは形式だけ検証する。
if (config.styles !== undefined) {
  if (!Array.isArray(config.styles) || config.styles.length === 0 || config.styles.some((s) => typeof s !== 'string' || s.trim() === '')) {
    throw new Error(`${configName} の "styles" はCSSファイルのパスを文字列の配列で指定してください。例: ["styles/document.css", "styles/header-table.css"]`);
  }
}
// "sourceDir": 原稿フォルダ(任意。未指定なら文書自身のフォルダ)。テンプレートのフォルダ基準。
if (config.sourceDir !== undefined && (typeof config.sourceDir !== 'string' || config.sourceDir.trim() === '')) {
  throw new Error(`${configName} の "sourceDir" は原稿フォルダのパスを文字列で指定してください。例: "documents/report"`);
}
// "files": 結合する原稿ファイルの一覧(必須)。
if (
  !Array.isArray(config.files) ||
  config.files.length === 0 ||
  config.files.some((entry) => !entry || typeof entry.file !== 'string' || entry.file.trim() === '')
) {
  throw new Error(`${configName} の "files" には、原稿ファイルを {"file": "..."} の配列で1つ以上指定してください。`);
}
// "output": 出力PDFのパス(必須)。
if (typeof config.output !== 'string' || config.output.trim() === '') {
  throw new Error(`${configName} の "output" に出力PDFのパスを文字列で指定してください。例: "dist/report.pdf"`);
}
const sourceDir = config.sourceDir !== undefined ? path.join(root, config.sourceDir) : path.dirname(configPath);
const generatedDir = path.join(root, '.vivliostyle', 'generated');
const generatedDiagramDir = path.join(generatedDir, 'diagrams');
const outputFile = path.join(generatedDir, 'document-bundle.md');

// 生成フォルダは文書間で共有されるため、前回ビルドの生成物
// (別文書のMermaid SVGなど)が混ざらないよう毎回作り直す
fs.rmSync(generatedDir, { recursive: true, force: true });

const counters = [0, 0, 0, 0];
const tocItems = [];
let mermaidIndex = 0;

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function slugify(text, number) {
  return `${number}-${text}`
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function nextNumber(level) {
  counters[level - 1] += 1;
  for (let i = level; i < counters.length; i += 1) {
    counters[i] = 0;
  }
  return counters.slice(0, level).join('.');
}

function isRemoteOrAbsolute(url) {
  return /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);
}

// 原稿ファイルからの相対パスを、バンドル(.vivliostyle/generated/)からの
// 相対パスに書き換える。バンドル位置基準で解決されるため、これがないと
// 画像がすべて404になる。
function rewriteRelativePath(url, fileDir) {
  if (isRemoteOrAbsolute(url)) {
    return url;
  }
  const absolute = path.resolve(fileDir, url);
  return toPosixPath(path.relative(generatedDir, absolute));
}

function rewriteImagePaths(line, fileDir) {
  return line
    .replace(
      /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g,
      (_, before, url, after) => before + rewriteRelativePath(url, fileDir) + after,
    )
    .replace(
      /(<img\b[^>]*\bsrc=")([^"]+)(")/g,
      (_, before, url, after) => before + rewriteRelativePath(url, fileDir) + after,
    );
}

// rootユーザー(Dockerコンテナ等)ではChromiumのサンドボックスが使えず
// mmdcが起動に失敗するため、サンドボックスを無効にした設定を渡す
function mermaidPuppeteerArgs() {
  if (process.platform !== 'linux' || typeof process.getuid !== 'function' || process.getuid() !== 0) {
    return [];
  }
  const configFile = path.join(generatedDir, 'puppeteer-config.json');
  fs.mkdirSync(generatedDir, { recursive: true });
  fs.writeFileSync(configFile, JSON.stringify({ args: ['--no-sandbox'] }) + '\n', 'utf8');
  return ['-p', toPosixPath(path.relative(root, configFile))];
}

function renderMermaid(source, sourceName) {
  fs.mkdirSync(generatedDiagramDir, { recursive: true });

  mermaidIndex += 1;
  const baseName = `${path.basename(sourceName, '.md')}-${String(mermaidIndex).padStart(2, '0')}`;
  const mmdFile = path.join(generatedDiagramDir, `${baseName}.mmd`);
  const svgFile = path.join(generatedDiagramDir, `${baseName}.svg`);
  const mmdPath = toPosixPath(path.relative(root, mmdFile));
  const svgPath = toPosixPath(path.relative(root, svgFile));

  fs.writeFileSync(mmdFile, source.trim() + '\n', 'utf8');

  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(
    npxCommand,
    ['mmdc', '-i', mmdPath, '-o', svgPath, '-b', 'transparent', ...mermaidPuppeteerArgs()],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  // バンドルからの相対パスで参照する
  return toPosixPath(path.relative(generatedDir, svgFile));
}

// コードフェンスを状態管理しながら1ファイル分を処理する。
// フェンス内は見出し検出・画像パス書き換えの対象外にする。
//
// 章の自動生成: <section を含まないファイルでは、h1(# 見出し)ごとに
// <section class="chapter"> で自動的に囲む(h1 = 章)。
// <section を自分で書いたファイル(表紙や特殊レイアウト)は手書きを尊重し、
// 自動生成しない。
function processMarkdown(markdown, entry, fileDir) {
  const output = [];
  const autoChapter = !/<section\b/i.test(markdown);
  const chapterClass = entry.unnumbered ? 'chapter unnumbered' : 'chapter';
  let sectionOpen = false;
  let fence = null; // { marker, isMermaid } — 開いているフェンス
  let mermaidLines = null;

  for (const line of markdown.split(/\r?\n/)) {
    if (fence) {
      const close = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
      if (
        close &&
        close[1][0] === fence.marker[0] &&
        close[1].length >= fence.marker.length
      ) {
        if (fence.isMermaid) {
          const svgPath = renderMermaid(mermaidLines.join('\n'), entry.file);
          output.push(`![Mermaid diagram](${svgPath})`);
          mermaidLines = null;
        } else {
          output.push(line);
        }
        fence = null;
      } else if (fence.isMermaid) {
        mermaidLines.push(line);
      } else {
        output.push(line);
      }
      continue;
    }

    const open = /^\s*(`{3,}|~{3,})\s*(\S*)/.exec(line);
    if (open) {
      if (open[2] === 'mermaid') {
        fence = { marker: open[1], isMermaid: true };
        mermaidLines = [];
      } else {
        fence = { marker: open[1], isMermaid: false };
        output.push(line);
      }
      continue;
    }

    const processed = rewriteImagePaths(line, fileDir);
    const heading = /^(#{1,4})\s+(.+)$/.exec(processed);
    if (heading) {
      const level = heading[1].length;
      if (autoChapter && level === 1) {
        if (sectionOpen) {
          output.push('', '</section>', '');
        }
        output.push(`<section class="${chapterClass}">`, '');
        sectionOpen = true;
      }
      if (entry.toc) {
        const title = heading[2].trim();
        // unnumbered のファイルは本文の見出しにも番号が付かないため、
        // 目次側も番号なしにして表示を一致させる
        const number = entry.unnumbered ? '' : nextNumber(level);
        const id = slugify(title, number);
        tocItems.push({ level, number, title, id });
        output.push(`<span id="${id}"></span>`, '', processed);
      } else {
        output.push(processed);
      }
    } else {
      output.push(processed);
    }
  }

  if (sectionOpen) {
    output.push('', '</section>');
  }

  return output.join('\n');
}

function buildToc() {
  const lines = [
    '<section class="toc unnumbered">',
    '',
    '# 目次',
    '',
    '<nav>',
    '  <ol class="toc-list">',
  ];

  for (const item of tocItems) {
    lines.push(
      `    <li class="toc-level-${item.level}"><a href="#${item.id}"><span class="toc-number">${item.number}</span><span class="toc-title">${item.title}</span></a></li>`,
    );
  }

  lines.push('  </ol>', '</nav>', '', '</section>');
  return lines.join('\n');
}

// document.config.jsonの"fonts"設定から、@font-face定義と本文フォントの
// 上書きを含む<style>ブロックを生成する。スタイルシート(styles/document.css)より
// 文書内の<style>が後に適用されるため、font-familyの指定が優先される。
const FONT_FORMATS = {
  '.ttf': 'truetype',
  '.otf': 'opentype',
  '.woff': 'woff',
  '.woff2': 'woff2',
};

function buildFontStyle(fonts) {
  if (!fonts) {
    return null;
  }
  if (typeof fonts.family !== 'string' || fonts.family.trim() === '') {
    throw new Error(`${configName} の "fonts.family" にフォント名を文字列で指定してください。`);
  }
  const lines = ['<style>'];
  for (const face of fonts.faces ?? []) {
    if (!face || typeof face.file !== 'string') {
      throw new Error(`${configName} の "fonts.faces" の各要素には "file" が必要です。`);
    }
    const absolute = path.resolve(root, face.file);
    if (!fs.existsSync(absolute)) {
      throw new Error(`フォントファイルが見つかりません: ${face.file}`);
    }
    const url = toPosixPath(path.relative(generatedDir, absolute));
    const format = FONT_FORMATS[path.extname(face.file).toLowerCase()];
    const family = typeof face.family === 'string' && face.family.trim() !== '' ? face.family : fonts.family;
    lines.push('@font-face {');
    lines.push(`  font-family: ${JSON.stringify(family)};`);
    lines.push(`  src: url(${JSON.stringify(url)})${format ? ` format(${JSON.stringify(format)})` : ''};`);
    if (face.weight !== undefined) {
      lines.push(`  font-weight: ${face.weight};`);
    }
    if (face.style !== undefined) {
      lines.push(`  font-style: ${face.style};`);
    }
    lines.push('}');
  }
  lines.push(
    `:root { font-family: ${JSON.stringify(fonts.family)}, "Yu Gothic", "YuGothic", "Meiryo", sans-serif; }`,
  );
  lines.push('</style>');
  return lines.join('\n');
}

// document.config.jsonの"footer"設定から、ページ下部余白に固定文字列を
// 出す<style>ブロックを生成する。中央はスタイルシート側のページ番号を
// そのまま使い、"center"を指定した場合のみ上書きする。
// 表紙(.cover)のページには、ページ番号と同様に表示しない。
const FOOTER_BOXES = { left: 'bottom-left', center: 'bottom-center', right: 'bottom-right' };

// CSSのcontent文字列として安全な形にエスケープする(改行は空白に置換)
function toCssString(text) {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ')}"`;
}

function buildFooterStyle(footer) {
  if (!footer) {
    return null;
  }
  const boxes = [];
  for (const [key, box] of Object.entries(FOOTER_BOXES)) {
    const text = footer[key];
    if (text === undefined || text === '') {
      continue;
    }
    if (typeof text !== 'string') {
      throw new Error(`${configName} の "footer.${key}" は文字列で指定してください。`);
    }
    boxes.push({ box, text });
  }
  if (boxes.length === 0) {
    return null;
  }
  const lines = ['<style>', '@page {'];
  for (const { box, text } of boxes) {
    lines.push(`  @${box} {`);
    lines.push(`    content: ${toCssString(text)};`);
    lines.push('    color: #5b6770;');
    lines.push('    font-size: 9pt;');
    lines.push('  }');
  }
  lines.push('}', '@page cover {');
  for (const { box } of boxes) {
    lines.push(`  @${box} {`);
    lines.push('    content: none;');
    lines.push('  }');
  }
  lines.push('}', '</style>');
  return lines.join('\n');
}

function readSource(entry) {
  const fullPath = path.join(sourceDir, entry.file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Markdown file not found: ${path.relative(root, fullPath)}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

const bundledParts = [
  '---',
  `title: ${JSON.stringify(String(config.title))}`,
  `author: ${JSON.stringify(String(config.author))}`,
  '---',
  '',
];

const fontStyle = buildFontStyle(config.fonts);
if (fontStyle) {
  bundledParts.push(fontStyle, '');
}

const footerStyle = buildFooterStyle(config.footer);
if (footerStyle) {
  bundledParts.push(footerStyle, '');
}

// 目次ページの挿入位置。"tocAfter" で指定したファイルの直後、
// "start" なら全ファイルより前(文書の先頭。表紙なし文書用)、
// 未指定なら先頭ファイルの直後に入れる。"toc": false なら挿入しない。
const tocAfterFile = config.tocAfter || config.files[0].file;
if (
  config.toc !== false &&
  tocAfterFile !== 'start' &&
  !config.files.some((entry) => entry.file === tocAfterFile)
) {
  throw new Error(`"tocAfter" file not found in files: ${tocAfterFile}`);
}

if (config.toc !== false && tocAfterFile === 'start') {
  bundledParts.push('__TOC__', '');
}

for (const entry of config.files) {
  const markdown = readSource(entry);
  const fileDir = path.dirname(path.join(sourceDir, entry.file));
  bundledParts.push(processMarkdown(markdown, entry, fileDir), '');

  if (config.toc !== false && entry.file === tocAfterFile) {
    bundledParts.push('__TOC__', '');
  }
}

fs.mkdirSync(generatedDir, { recursive: true });
fs.writeFileSync(
  outputFile,
  bundledParts.join('\n').replace('__TOC__', buildToc()),
  'utf8',
);

console.log(`Generated ${path.relative(root, outputFile)}`);
