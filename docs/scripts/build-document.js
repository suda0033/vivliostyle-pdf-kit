const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const config = require(path.join(root, 'document.config.json'));
const sourceDir = path.join(root, config.sourceDir);
const generatedDir = path.join(root, '.vivliostyle', 'generated');
const generatedDiagramDir = path.join(generatedDir, 'diagrams');
const outputFile = path.join(generatedDir, 'document-bundle.md');

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
    ['mmdc', '-i', mmdPath, '-o', svgPath, '-b', 'transparent'],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  // バンドルからの相対パスで参照する
  return toPosixPath(path.relative(generatedDir, svgFile));
}

// コードフェンスを状態管理しながら1ファイル分を処理する。
// フェンス内は見出し検出・画像パス書き換えの対象外にする。
function processMarkdown(markdown, entry, fileDir) {
  const output = [];
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
    if (heading && entry.toc) {
      const level = heading[1].length;
      const title = heading[2].trim();
      const number = nextNumber(level);
      const id = slugify(title, number);
      tocItems.push({ level, number, title, id });
      output.push(`<span id="${id}"></span>`, '', processed);
    } else {
      output.push(processed);
    }
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

for (const entry of config.files) {
  const markdown = readSource(entry);
  const fileDir = path.dirname(path.join(sourceDir, entry.file));
  bundledParts.push(processMarkdown(markdown, entry, fileDir), '');

  // トップレベルの "toc": false で目次ページ自体を省略できる(未指定なら出す)
  if (config.toc !== false && entry.file === config.files[0].file) {
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
