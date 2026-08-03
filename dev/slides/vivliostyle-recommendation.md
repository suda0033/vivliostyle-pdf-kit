<section class="slide title-slide">
  <p class="eyebrow">AI駆動開発ドキュメント運用 提案</p>
  <h1>Markdownから提出用PDFへ</h1>
  <p class="lead">Gitで管理し、AIで更新し、VivliostyleでPDF化する。</p>
  <p class="meta">Vivliostyle template sample</p>
</section>

<section class="slide">
  <p class="eyebrow">Background</p>
  <h2>なぜドキュメントをMarkdownで書くのか</h2>
  <div class="two-column">
    <div>
      <h3>Gitで管理できる</h3>
      <ul>
        <li>差分が明確でレビューしやすい</li>
        <li>履歴、ブランチ、プルリクエストと相性がよい</li>
        <li>仕様変更の経緯を後から追える</li>
      </ul>
    </div>
    <div>
      <h3>生成AIが扱いやすい</h3>
      <ul>
        <li>テキストなので読み書きが安定する</li>
        <li>WordやExcelよりトークン消費を抑えやすい</li>
        <li>コード、テスト、仕様をまとめて更新しやすい</li>
      </ul>
    </div>
  </div>
</section>

<section class="slide contrast">
  <p class="eyebrow">Problem</p>
  <h2>従来の仕様書更新は、人の確認コストが大きい</h2>
  <div class="comparison">
    <div>
      <h3>Excel / Word中心</h3>
      <p>該当箇所を探し、修正箇所に目印を付け、レビュー後に目印を外す。変更漏れが起きやすく、実装だけ進んで仕様書が置き去りになりやすい。</p>
    </div>
    <div>
      <h3>Markdown + Git中心</h3>
      <p>AIに変更を指示し、仕様、コード、テストを同じ変更単位で更新する。人間はGit上で差分を確認し、方向性と受け入れを判断する。</p>
    </div>
  </div>
</section>

<section class="slide">
  <p class="eyebrow">Workflow</p>
  <h2>AI駆動開発では、文書も開発成果物として扱う</h2>
  <figure class="wide-figure">
    <img src="../samples/assets/ai-driven-workflow.svg" alt="AI駆動開発とPDF化のワークフロー">
  </figure>
  <p class="note">Markdown文書化までを開発フローに含め、最後にVivliostyleでPDFへ変換する。</p>
</section>

<section class="slide">
  <p class="eyebrow">Gap</p>
  <h2>Markdownのままだと、提出資料にはしづらい</h2>
  <div class="large-points">
    <p><strong>エンジニア向け:</strong> Markdownで十分読みやすい。</p>
    <p><strong>顧客・社外向け:</strong> Markdownを標準で読める環境がないことが多い。</p>
    <p><strong>必要な形:</strong> 目次、章番号、図表、ページ番号を持つPDF。</p>
  </div>
</section>

<section class="slide accent">
  <p class="eyebrow">Solution</p>
  <h2>VivliostyleでMarkdownをPDF資料化する</h2>
  <p class="big-message">Markdownの保守性を残したまま、提出用のPDFに整える。</p>
  <div class="feature-row">
    <span>CSS組版</span>
    <span>目次</span>
    <span>章番号</span>
    <span>表</span>
    <span>コード</span>
    <span>Mermaid図</span>
  </div>
</section>

<section class="slide">
  <p class="eyebrow">Repository Design</p>
  <h2>推奨するドキュメント構成</h2>
  <pre class="tree"><code>docs/manuscript/
  00-cover.md
  01-overview.md
  02-operation.md
docs/styles/
  document.css
docs/scripts/
  build-document.js
docs/dist/
  project-document.pdf</code></pre>
  <p class="note">機能単位のMarkdownを束ね、ビルド時に目次や図の変換を行う。</p>
</section>

<section class="slide">
  <p class="eyebrow">Mermaid Policy</p>
  <h2>原稿はMermaid、PDFはSVGで固定する</h2>
  <div class="process">
    <div>Markdown内に<br>Mermaidで記述</div>
    <div>ビルド時に<br>SVGへ変換</div>
    <div>PDFには<br>画像として埋め込み</div>
  </div>
  <p class="note">原稿側はテキストとしてレビューでき、PDF側は表示崩れを避けやすい。</p>
</section>

<section class="slide">
  <p class="eyebrow">Operation</p>
  <h2>運用イメージ</h2>
  <ol class="steps">
    <li>仕様をMarkdownで更新する</li>
    <li>AIが関連コード、テスト、文書を同じ変更で修正する</li>
    <li>GitHub上で差分レビューする</li>
    <li>CIでPDFを自動生成する</li>
    <li>提出物としてPDFを共有する</li>
  </ol>
</section>

<section class="slide closing">
  <p class="eyebrow">Recommendation</p>
  <h2>Markdownを正本にして、PDFを成果物にする</h2>
  <p class="big-message">AI駆動開発では、仕様書もコードと同じ流れで育てる。</p>
  <p class="lead">Vivliostyleは、その文書を提出できる形に整えるための現実的な選択肢。</p>
</section>
