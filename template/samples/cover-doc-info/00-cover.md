<!--
  表紙にドキュメント情報の表を置くサンプル。
  <section class="cover"> の中に <div class="doc-info"> を書くと、
  styles/document.css の「.cover .doc-info」の上書きが効いて
  表が表紙の最上部に配置される(タイトルは中央のまま)。
  承認欄の <a class="pdf-field" href="pdf-field://名前"></a> は、生成後のPDFで
  直接記入できる入力欄になる。<div> の内側に空行を入れないこと。
-->
<section class="cover">

<div class="doc-info">
  <table>
    <tbody>
      <tr>
        <th>プロジェクト名</th>
        <th>文書番号</th>
      </tr>
      <tr>
        <td>受注連携システム</td>
        <td>SPEC-2026-001</td>
      </tr>
    </tbody>
  </table>
  <table class="doc-info-right">
    <tbody>
      <tr>
        <th>作成</th>
        <th>更新</th>
        <th>確認</th>
      </tr>
      <tr>
        <td><a class="pdf-field" href="pdf-field://created-by"></a></td>
        <td><a class="pdf-field" href="pdf-field://updated-by"></a></td>
        <td><a class="pdf-field" href="pdf-field://reviewed-by"></a></td>
      </tr>
    </tbody>
  </table>
</div>

# 表紙ドキュメント情報の表サンプル

作成者: 開発チーム

作成日: 2026-08-25

</section>
