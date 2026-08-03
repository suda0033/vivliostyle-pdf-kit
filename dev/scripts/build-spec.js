const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = process.cwd();
const sourceDir = path.join(root, 'samples', 'spec');
const generatedDiagramDir = path.join(root, 'samples', 'spec', 'assets', 'generated');
const outputDir = root;
const outputFile = path.join(outputDir, 'spec-bundle.md');

const files = [
  { file: '00-cover.md', toc: false },
  { file: '01-overview.md', toc: true },
  { file: '02-login.md', toc: true },
  { file: '03-order-import.md', toc: true },
  { file: '04-stock-allocation.md', toc: true },
  { file: '05-result-export.md', toc: true },
  { file: '90-data-and-files.md', toc: true },
  { file: '99-appendix.md', toc: true },
];

const counters = [0, 0, 0, 0];
const tocItems = [];
let mermaidIndex = 0;

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

function renderMermaid(source, baseName) {
  fs.mkdirSync(generatedDiagramDir, { recursive: true });

  const mmdFile = path.join(generatedDiagramDir, `${baseName}.mmd`);
  const svgFile = path.join(generatedDiagramDir, `${baseName}.svg`);
  const mmdPath = path.relative(root, mmdFile).replace(/\\/g, '/');
  const svgPath = path.relative(root, svgFile).replace(/\\/g, '/');
  fs.writeFileSync(mmdFile, source.trim() + '\n', 'utf8');

  const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execFileSync(
    npxCommand,
    ['mmdc', '-i', mmdPath, '-o', svgPath, '-b', 'transparent'],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
  );

  return svgPath;
}

// コードフェンスを状態管理しながら1ファイル分を処理する。
// フェンス内の行を見出しとして拾わないようにする。
function processMarkdown(markdown, entry) {
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
          mermaidIndex += 1;
          const baseName = `${path.basename(entry.file, '.md')}-${String(mermaidIndex).padStart(2, '0')}`;
          const svgPath = renderMermaid(mermaidLines.join('\n'), baseName);
          output.push(`![システムフロー図](${svgPath})`);
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

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading && entry.toc) {
      const level = heading[1].length;
      const title = heading[2].trim();
      const number = nextNumber(level);
      const id = slugify(title, number);
      tocItems.push({ level, number, title, id });
      output.push(`<span id="${id}"></span>`, '', line);
    } else {
      output.push(line);
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

const bundledParts = [
  '---',
  'title: 機能仕様書サンプル',
  'author: 開発チーム',
  'date: 2026-06-30',
  '---',
  '',
];

for (const entry of files) {
  const fullPath = path.join(sourceDir, entry.file);
  const markdown = fs.readFileSync(fullPath, 'utf8');
  bundledParts.push(processMarkdown(markdown, entry), '');

  if (entry.file === '00-cover.md') {
    bundledParts.push('__TOC__', '');
  }
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputFile,
  bundledParts.join('\n').replace('__TOC__', buildToc()),
  'utf8',
);

console.log(`Generated ${path.relative(root, outputFile)}`);
