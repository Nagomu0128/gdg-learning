import { describe, expect, it } from "vitest";
import { lintHtml } from "./markup-lint";
import { KNOWN_CSS_PROPERTIES, lintCss, suggestCssProperty } from "./markup-lint-css";

// ---------------------------------------------------------------------------
// lintHtml — エラー検出
// ---------------------------------------------------------------------------

describe("lintHtml: 発端ケース(</h1 のまま EOF)", () => {
  it("<h1>hello</h1 を eof-in-end-tag として検出する", () => {
    const diags = lintHtml("<h1>hello</h1");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(1);
    expect(diags[0]?.message).toBe(
      "1行目の </h1 が「>」で閉じられていません。タグの終わりに「>」を書きましょう",
    );
  });

  it("複数行ドキュメントの途中でも行番号つきで検出する", () => {
    const diags = lintHtml("<div>\n  <h1>hello</h1\n</div>");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect(diags.some((d) => d.line === 2 && d.message.includes("</h1"))).toBe(true);
  });
});

describe("lintHtml: eof-in-open-tag(開始タグが > で閉じない)", () => {
  it("<h1 のまま EOF", () => {
    const diags = lintHtml("<h1");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe(
      "1行目の <h1 が「>」で閉じられていません。タグの終わりに「>」を書きましょう",
    );
  });

  it("属性つきでも検出する", () => {
    const diags = lintHtml('<a href="a.html"');
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("<a が「>」で閉じられていません");
  });

  it("ネスト内では祖先の閉じ忘れも合わせて報告する", () => {
    const diags = lintHtml("<div>\n<h1");
    expect(diags).toHaveLength(2);
    expect(diags[0]?.message).toContain("<div>");
    expect(diags[1]?.line).toBe(2);
    expect(diags[1]?.message).toContain("<h1 が「>」で閉じられていません");
  });

  it("CRLF でも行番号が正しい", () => {
    const diags = lintHtml("<p>a</p>\r\n<h1");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
  });

  it("引用符なし属性値の途中の EOF も開始タグの閉じ忘れになる", () => {
    const diags = lintHtml("<a href=index.html");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("「>」で閉じられていません");
  });
});

describe("lintHtml: lt-in-open-tag(> より先に次の < が出現)", () => {
  it("<h1 hello</h1> は開始タグの > 抜け", () => {
    const diags = lintHtml("<h1 hello</h1>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(1);
    expect(diags[0]?.message).toContain("<h1 が「>」で閉じられていません");
  });

  it("後続の終了タグと対応づけて連鎖エラーを出さない", () => {
    const diags = lintHtml("<p><b hello</b></p>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("<b が「>」で閉じられていません");
  });

  it("引用符なし属性値の直後の < も検出する", () => {
    const diags = lintHtml("<a href=x<p>y</p>");
    expect(diags.some((d) => d.message.includes("<a が「>」で閉じられていません"))).toBe(true);
  });
});

describe("lintHtml: eof-in-end-tag", () => {
  it("</div のまま EOF(ネスト内)", () => {
    const diags = lintHtml("<section><div>x</div\n");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect(diags.some((d) => d.message.includes("</div が「>」で閉じられていません"))).toBe(true);
  });

  it("CRLF 複数行でも行番号が正しい", () => {
    const diags = lintHtml("<div>\r\n<p>a</p>\r\n</div\r\n".trimEnd());
    expect(diags.some((d) => d.line === 3 && d.message.includes("</div"))).toBe(true);
  });

  it("終了タグの直後に次のタグが来ても > 抜けを検出する", () => {
    const diags = lintHtml("<div><p>a</p</div>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("</p が「>」で閉じられていません");
  });
});

describe("lintHtml: eof-in-attr-quote(属性の引用符が閉じない)", () => {
  it('href="... のまま EOF', () => {
    const diags = lintHtml('<a href="index.html');
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe(
      '1行目: href の値を囲む「"」が閉じられていません。値の終わりにもう1つ「"」を書きましょう',
    );
  });

  it("シングルクオートでも検出する", () => {
    const diags = lintHtml("<img src='a.png");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("src の値を囲む「'」が閉じられていません");
  });

  it("複数行にわたっても引用符の開始行を指す", () => {
    const diags = lintHtml('<div>\n  <a href="a.html>リンク</a>\n</div>');
    expect(diags.some((d) => d.line === 2 && d.message.includes("href の値を囲む"))).toBe(true);
  });
});

describe("lintHtml: unclosed-element(要素の閉じ忘れ)", () => {
  it("<h1> が最後まで閉じられない", () => {
    const diags = lintHtml("<h1>hello");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("1行目の <h1> が閉じられていません。終了タグ </h1> を書きましょう");
  });

  it("開始タグの行番号を指す(交差の案内と両方報告する)", () => {
    const diags = lintHtml("<div>\n  <span>text\n</div>");
    expect(diags).toHaveLength(2);
    expect(diags[0]?.line).toBe(2);
    expect(diags[0]?.message).toContain("<span> が閉じられていません");
    expect(diags[1]?.message).toContain("先に 2行目の <span> を </span> で閉じましょう");
  });

  it("複数の閉じ忘れをすべて報告する", () => {
    const diags = lintHtml("<article><h1>a\n<em>b");
    expect(diags).toHaveLength(3);
  });

  it("<script> が閉じないままの EOF", () => {
    const diags = lintHtml("<script>const a = 1;");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("<script> が閉じられていません。終了タグ </script> を書きましょう");
  });

  it("<style> が閉じないままの EOF", () => {
    const diags = lintHtml("<style>h1 { color: red; }");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("<style> が閉じられていません");
  });
});

describe("lintHtml: orphan-end-tag(対応する開始タグがない終了タグ)", () => {
  it("</h2> 単独", () => {
    const diags = lintHtml("<h1>a</h1></h2>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("1行目の </h2> に対応する開始タグ <h2> がありません");
  });

  it("閉じすぎ(</div> が 2 回)", () => {
    const diags = lintHtml("<div>x</div>\n</div>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
    expect(diags[0]?.message).toContain("</div> に対応する開始タグ");
  });

  it("ネスト内でも検出する", () => {
    const diags = lintHtml("<ul><li>a</span></li></ul>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("</span> に対応する開始タグ <span> がありません");
  });
});

describe("lintHtml: mismatched-end-tag(交差ネスト)", () => {
  it("<b><i></b></i> は 1 件で「先に <i> を閉じる」と案内する", () => {
    const diags = lintHtml("<b><i>text</b></i>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("1行目の </b>: 先に 1行目の <i> を </i> で閉じましょう");
  });

  it("ブロックしている要素の開始行を案内する", () => {
    const diags = lintHtml("<div>\n<section>\n</div>\n</section>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(3);
    expect(diags[0]?.message).toContain("先に 2行目の <section> を </section> で閉じましょう");
  });

  it("交差 + 閉じ忘れは両方報告する", () => {
    const diags = lintHtml("<b><i>text</b>");
    expect(diags).toHaveLength(2);
    expect(diags.some((d) => d.message.includes("</b>: 先に"))).toBe(true);
    expect(diags.some((d) => d.message.includes("<i> が閉じられていません"))).toBe(true);
  });
});

describe("lintHtml: void-end-tag(void 要素の終了タグ)", () => {
  it.each(["img", "br", "input", "hr", "meta"])("</%s> を検出する", (tag) => {
    const diags = lintHtml(`<p>a</${tag}>b</p>`);
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe(`1行目: <${tag}> は終了タグが不要なタグです。</${tag}> を削除しましょう`);
  });

  it("<img ...></img> は終了タグ側だけを報告する", () => {
    const diags = lintHtml('<img src="a.png" alt="a"></img>');
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("<img> は終了タグが不要");
  });
});

describe("lintHtml: eof-in-comment(コメントが閉じない)", () => {
  it("<!-- のまま EOF", () => {
    const diags = lintHtml("<p>a</p>\n<!-- ここにコメント");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("2行目の <!-- が --> で閉じられていません");
  });

  it("--> の書きかけ(-- >)も検出する", () => {
    const diags = lintHtml("<!-- comment -- >");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("<!-- が --> で閉じられていません");
  });
});

describe("lintHtml: タグ内の全角記号は zenkaku 様式を優先する", () => {
  it("属性の全角イコール", () => {
    const diags = lintHtml('<a href＝"a.html">x</a>');
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("1行目に全角の「＝」が入っています。半角の「=」に直しましょう");
  });

  it("属性値の全角クオート(引用符なし値の先頭)", () => {
    const diags = lintHtml("<a href=＂a.html＂>x</a>");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("全角の「＂」");
    expect(diags[0]?.message).toContain('半角の「"」に直しましょう');
  });

  it("タグ名の全角英数字", () => {
    const diags = lintHtml("<h１>x</h1>");
    expect(diags.some((d) => d.message.includes("全角の「１」"))).toBe(true);
  });

  it("タグ内の全角スペース", () => {
    const diags = lintHtml('<img　src="a.png">');
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("全角スペース");
    expect(diags[0]?.message).toContain("半角スペースに直しましょう");
  });

  it("構造エラーと重なる場合も zenkaku 文言を優先する", () => {
    const diags = lintHtml('<a href＝"a.html');
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("全角の「＝」");
  });
});

describe("lintHtml: 複数エラーは位置順に返す", () => {
  it("行の昇順で並ぶ", () => {
    const diags = lintHtml("<p>a</img>\n<h1>b\n<div>c</span></div>");
    expect(diags.length).toBeGreaterThanOrEqual(3);
    const lines = diags.map((d) => d.line);
    expect([...lines].sort((a, b) => a - b)).toEqual(lines);
  });
});

// ---------------------------------------------------------------------------
// lintHtml — 偽陽性ガード(合法な書き方は絶対に咎めない)
// ---------------------------------------------------------------------------

describe("lintHtml: 偽陽性ガード", () => {
  it.each([
    ["空文字列", ""],
    ["テキストのみ", "こんにちは、世界"],
    ["doctype", "<!doctype html>"],
    ["大文字 DOCTYPE", "<!DOCTYPE html>"],
    ["テキスト中の <(数字)", "<p>スコアは 3 <5 です</p>"],
    ["テキスト中の <3", "<p>I <3 you</p>"],
    ["テキスト中の比較演算子", "<p>1 < 2 は true、 3 > 1 も true</p>"],
    ["< + 空白", "<p>a < b</p>"],
    ["HTML エンティティ", "<p>&lt;h1&gt; と &amp; と &copy;</p>"],
    ["絵文字と日本語", "<p>おめでとう🎉 これで完成です！</p>"],
    ["void 要素(閉じなし)", '<img src="a.png" alt="りんご">'],
    ["void 要素(自己閉鎖)", '<img src="a.png" alt="りんご" />'],
    ["<br> と <br/>", "<p>一行目<br>二行目<br/>三行目</p>"],
    ["<hr>", "<main><hr></main>"],
    ["meta / link", '<head><meta charset="utf-8"><link rel="stylesheet" href="style.css"></head>'],
    ["boolean 属性", '<input type="checkbox" checked required>'],
    ["引用符なし属性値", "<input type=text value=hello>"],
    ["引用符なし属性値にスラッシュ", "<a href=docs/index.html>docs</a>"],
    ["大文字タグ名", '<DIV CLASS="box">x</DIV>'],
    ["属性値内の < >", '<p title="a < b > c">x</p>'],
    ["属性値内の改行", '<img\n  src="a.png"\n  alt="例"\n/>'],
    ["属性名と = の間の空白", '<a href = "a.html">x</a>'],
    ["li の終了タグ省略", "<ul><li>りんご<li>みかん</ul>"],
    ["ol でも li 省略可", "<ol><li>一番<li>二番</ol>"],
    ["p の終了タグ省略(ブロック要素で自動クローズ)", "<p>まえがき<div>本文</div>"],
    ["p の連続", "<p>一段落<p>二段落"],
    ["p が EOF まで開いたまま", "<p>これで終わり"],
    ["li が EOF まで開いたまま", "<ul><li>a</ul>"],
    ["td / th / tr の省略", "<table><tr><th>名前<th>値段<tr><td>りんご<td>150円</table>"],
    ["dt / dd の省略", "<dl><dt>用語<dd>説明<dt>用語2<dd>説明2</dl>"],
    ["option の省略", "<select><option>A<option>B</select>"],
    ["コメント内のタグ様文字列", "<!-- <div> や </h1 もコメントなら無害 -->"],
    ["コメント誘導(教材の書き方)", "<body>\n  <!-- ここに h1 を書こう -->\n</body>"],
    ["コメント内の連続ハイフン", "<!-- a -- b -->"],
    ["空コメント <!-->", "<!-->"],
    ["script 内のタグ様文字列", '<script>if (a < b) { document.write("<div>x</div>"); }</script>'],
    ["script src(空要素)", '<script src="script.js"></script>'],
    ["style 内の CSS", "<style>h1 { color: red; } p > a { color: blue; }</style>"],
    ["title 内の記号", "<title>a < b > c</title>"],
    ["textarea 内のタグ様文字列", "<textarea><h1>入力例</h1></textarea>"],
    ["交差していない正しいネスト", "<b><i>強調</i></b>"],
    ["自己閉鎖風の非 void(開始タグ扱い→終了タグで閉じ)", "<span/>x</span>"],
    ["CRLF 改行", "<div>\r\n  <p>a</p>\r\n</div>"],
    [
      "フォーム一式",
      '<form><label for="n">名前</label><input id="n" type="text"><button>送信</button></form>',
    ],
  ])("%s はエラーにしない", (_label, source) => {
    expect(lintHtml(source)).toEqual([]);
  });

  it("実教材と同型のフルドキュメントはエラーにしない", () => {
    const doc = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>すきなくだもの</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>すきなくだもの</h1>
    <table>
      <tr>
        <th>名前</th>
        <!-- ここに「値段」の見出しセル(th)を書こう -->
      </tr>
      <tr>
        <td>りんご</td>
        <td>150円</td>
      </tr>
    </table>
    <script src="script.js"></script>
  </body>
</html>
`;
    expect(lintHtml(doc)).toEqual([]);
  });

  it("本文テキスト中の全角記号(正当)はエラーにしない", () => {
    expect(lintHtml("<p>（例）これは全角の＜＞や＝を含む正しい文です。</p>")).toEqual([]);
  });

  it("引用符つき属性値内の全角はエラーにしない", () => {
    expect(lintHtml('<img src="a.png" alt="りんご（例）＝おいしい">')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// lintCss — エラー検出
// ---------------------------------------------------------------------------

describe("lintCss: unclosed-block({ が閉じない)", () => {
  it("h1 { が EOF まで閉じない", () => {
    const diags = lintCss("h1 {\n  color: red;\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("1行目の「h1 {」が「}」で閉じられていません");
  });

  it("セレクタの行番号を指す", () => {
    const diags = lintCss("p { color: blue; }\n\n.card {\n  padding: 16px;");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(3);
    expect(diags[0]?.message).toContain("「.card {」");
  });

  it("@media の閉じ忘れ(内側は閉じている)", () => {
    const diags = lintCss("@media (max-width: 600px) {\n  h1 { color: red; }\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("「@media (max-width: 600px) {」が「}」で閉じられていません");
  });

  it("@media 内で } が 1 つ足りない場合は外側の @media を未閉じとして報告する", () => {
    // } は最も内側の開きブロック(h1)に対応づくため、閉じ忘れは @media 側に帰着する(ブラウザと同じ解釈)
    const diags = lintCss("@media (max-width: 600px) {\n  h1 { color: red;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(1);
    expect(diags[0]?.message).toContain("「@media (max-width: 600px) {」が「}」で閉じられていません");
  });

  it("CRLF でも行番号が正しい", () => {
    const diags = lintCss("p { color: blue; }\r\nh1 {\r\n  color: red;\r\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
  });
});

describe("lintCss: stray-close(対応する { のない })", () => {
  it("トップレベルの余分な }", () => {
    const diags = lintCss("h1 { color: red; }\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
    expect(diags[0]?.message).toContain("対応する「{」のない「}」");
    expect(diags[0]?.message).toContain("削除しましょう");
  });

  it("ファイル先頭の }", () => {
    const diags = lintCss("}");
    expect(diags).toHaveLength(1);
  });
});

describe("lintCss: missing-brace(セレクタの後の { 抜け)", () => {
  it("h1 color: red; を検出する", () => {
    const diags = lintCss("h1 color: red;\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("1行目: セレクタ「h1」の後ろに「{」が必要です");
  });

  it("複合セレクタも切り出す", () => {
    const diags = lintCss(".card p color: red;\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("セレクタ「.card p」の後ろに「{」が必要です");
  });

  it("後続の宣言と閉じ } に連鎖エラーを出さない", () => {
    const diags = lintCss("h1\n  color: red;\n  font-size: 16px;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("セレクタ「h1」の後ろに「{」が必要です");
  });
});

describe("lintCss: missing-colon(プロパティの後の : 抜け)", () => {
  it("color red; を検出する", () => {
    const diags = lintCss("h1 {\n  color red;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("2行目:「color」の後ろに「:」が必要です(例: color: 値;)");
  });

  it("ブロック末尾(; なし)でも検出する", () => {
    const diags = lintCss("h1 { color }");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("「color」の後ろに「:」が必要です");
  });

  it("ハイフンつきプロパティも検出する", () => {
    const diags = lintCss(".box {\n  font-size 16px;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
    expect(diags[0]?.message).toContain("「font-size」の後ろに「:」が必要です");
  });

  it("未知の単語は咎めない(偽陽性ゼロ側)", () => {
    expect(lintCss("h1 {\n  foo bar;\n}\n")).toEqual([]);
  });
});

describe("lintCss: missing-semicolon(既知プロパティゲート付き)", () => {
  it("宣言の値の改行後に既知プロパティ+: が来たら ; 抜け", () => {
    const diags = lintCss("h1 {\n  color: red\n  font-size: 16px;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("2行目: 宣言の終わりに「;」が必要です");
  });

  it("; 抜けの行(直前の宣言の値の行)を指す", () => {
    const diags = lintCss(".card {\n  padding: 12px\n  margin: 8px;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
  });

  it("連続する ; 抜けをそれぞれ検出する", () => {
    const diags = lintCss("h1 {\n  color: red\n  font-size: 16px\n  text-align: center;\n}\n");
    expect(diags).toHaveLength(2);
    expect(diags[0]?.line).toBe(2);
    expect(diags[1]?.line).toBe(3);
  });

  it("次行が未知の単語なら発火しない(複数行の値)", () => {
    expect(lintCss('h1 {\n  font-family: "Noto Sans JP",\n    sans-serif;\n}\n')).toEqual([]);
  });
});

describe("lintCss: 全角記号は zenkaku 様式を優先する", () => {
  it("全角コロン(color： red;)", () => {
    const diags = lintCss("h1 {\n  color： red;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("2行目に全角の「：」が入っています。半角の「:」に直しましょう");
  });

  it("全角セミコロン(; 抜け症状に接続)", () => {
    const diags = lintCss("h1 {\n  color: red；\n  font-size: 16px;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("全角の「；」");
    expect(diags[0]?.message).toContain("半角の「;」に直しましょう");
  });

  it("全角の開き波かっこ", () => {
    const diags = lintCss("h1 ｛\n  color: red;\n");
    expect(diags.length).toBeGreaterThanOrEqual(1);
    expect(diags[0]?.message).toContain("全角の「｛」");
  });

  it("プロパティ名の全角英字(ｃｏｌｏｒ)", () => {
    const diags = lintCss("h1 {\n  ｃｏｌｏｒ: red;\n}\n");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toContain("全角の「ｃ」");
  });
});

describe("lintCss: 閉じないコメント", () => {
  it("/* が EOF まで閉じない", () => {
    const diags = lintCss("h1 { color: red; }\n/* コメント");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.line).toBe(2);
    expect(diags[0]?.message).toContain("「/*」が「*/」で閉じられていません");
  });
});

// ---------------------------------------------------------------------------
// lintCss — 偽陽性ガード
// ---------------------------------------------------------------------------

describe("lintCss: 偽陽性ガード", () => {
  it.each([
    ["空文字列", ""],
    ["コメントのみ", "/* ここに style を書こう */"],
    ["基本のルール", "h1 {\n  color: red;\n}\n"],
    ["最後の宣言の ; 省略", "h1 {\n  color: red\n}\n"],
    ["一行スタイル + ; 省略", "h1{color:red}"],
    ["複数ルール", "h1 { color: red; }\np { color: blue; }\n"],
    ["空のルール", "h1 {  }"],
    ["クラス・子孫・結合子", ".card > p + span ~ a { color: red; }"],
    ["疑似クラス", "a:hover { text-decoration: underline; }"],
    ["疑似要素", "p::first-line { font-weight: bold; }"],
    [":nth-child の式", "li:nth-child(2n+1) { background-color: #eee; }"],
    ["属性セレクタ内の : と ;", 'a[href="a:b;c"] { color: red; }'],
    ["複数セレクタの改行", "h1,\nh2 {\n  color: red;\n}\n"],
    ["@media のネスト", "@media (max-width: 600px) {\n  h1 { font-size: 18px; }\n}\n"],
    ["@media の中に複数ルール", "@media screen {\n  h1 { color: red; }\n  p { color: blue; }\n}\n"],
    ["@import(文 at-rule)", '@import url("base.css");\nh1 { color: red; }\n'],
    ["@charset", '@charset "utf-8";'],
    ["未知の at-rule(ブロック)", "@foo bar {\n  anything goes here\n}\nh1 { color: red; }\n"],
    ["未知の at-rule(文)", "@foo bar;\nh1 { color: red; }\n"],
    [
      "@keyframes",
      "@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n",
    ],
    ["@font-face", '@font-face {\n  font-family: "My Font";\n  src: url("font.woff2");\n}\n'],
    ["url() 内の :", "body { background-image: url(https://example.com/a.png); }"],
    ["url() 内の ; と :(データ URI)", "body { background-image: url(data:image/png;base64,iVBORw0K); }"],
    ["文字列内の ; { }", 'p::before { content: "a;b{c}d"; }'],
    ["文字列内のシングルクオート", "p::before { content: 'a;b{'; }"],
    ["複数値・スラッシュ", "body { font: bold 14px/1.6 sans-serif; }"],
    ["カンマ区切りの値", "h1 { font-family: Arial, sans-serif; }"],
    ["transition の複数値", ".btn { transition: color 0.2s, background-color 0.2s; }"],
    ["calc()", ".box { width: calc(100% - 32px); }"],
    ["rgb() / rgba()", "h1 { color: rgb(255, 0, 0); background-color: rgba(0, 0, 0, 0.5); }"],
    ["カスタムプロパティ", ":root {\n  --main-color: #333;\n}\nh1 { color: var(--main-color); }\n"],
    ["日本語のカスタムプロパティ", ":root { --メイン色: red; }"],
    ["値の途中の改行(次行が値の続き)", "h1 {\n  background:\n    url(a.png)\n    no-repeat;\n}\n"],
    ["コロンの直後で改行", ".btn {\n  transition:\n    color 0.2s;\n}\n"],
    [
      "grid-template-areas の複数行文字列",
      '.grid {\n  grid-template-areas:\n    "header header"\n    "nav main";\n}\n',
    ],
    ["ベンダープレフィックス", ".box { -webkit-user-select: none; }"],
    ["!important", "h1 { color: red !important; }"],
    ["宣言の間のコメント", "h1 {\n  /* 色 */\n  color: red; /* 赤 */\n}\n"],
    ["日本語クラス名", ".ボタン { color: red; }"],
    ["引用符つきフォント名の全角", 'body { font-family: "ＭＳ ゴシック", sans-serif; }'],
    ["余分なセミコロン", "h1 { color: red;; }\n;\n"],
    ["CRLF", "h1 {\r\n  color: red;\r\n}\r\n"],
  ])("%s はエラーにしない", (_label, source) => {
    expect(lintCss(source)).toEqual([]);
  });

  it("実教材と同型のスタイルシートはエラーにしない", () => {
    const css = `body {
  font-family: sans-serif;
}

.container {
  background-color: #e0f2fe;
  padding: 12px;
  /* ここに display と justify-content を書いて、3つのプランを横にならべよう */
  display: flex;
  justify-content: space-between;
}

.item {
  background-color: #ffffff;
  border: 1px solid #7dd3fc;
  border-radius: 8px;
  padding: 16px;
}
`;
    expect(lintCss(css)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// suggestCssProperty / KNOWN_CSS_PROPERTIES
// ---------------------------------------------------------------------------

describe("suggestCssProperty", () => {
  it.each([
    ["colr", "color"],
    ["colour", "color"],
    ["colro", "color"],
    ["font-siz", "font-size"],
    ["font-sise", "font-size"],
    ["backgroud-color", "background-color"],
    ["widht", "width"],
    ["heigth", "height"],
    ["dispaly", "display"],
    ["paddin", "padding"],
    ["margn", "margin"],
    ["justify-contnt", "justify-content"],
    ["align-itmes", "align-items"],
    ["flex-directoin", "flex-direction"],
    ["boder-radius", "border-radius"],
  ])("%s → %s", (input, expected) => {
    expect(suggestCssProperty(input)).toBe(expected);
  });

  it.each([["color"], ["font-size"], ["background-color"], ["gap"]])("既知そのもの(%s)は null", (input) => {
    expect(suggestCssProperty(input)).toBeNull();
  });

  it("大文字・前後空白を正規化して判定する", () => {
    expect(suggestCssProperty(" Color ")).toBeNull();
    expect(suggestCssProperty("COLR")).toBe("color");
  });

  it("距離 3 以上は null", () => {
    expect(suggestCssProperty("clr")).toBeNull(); // color まで距離 2 だが長さ 3 なので閾値 1
    expect(suggestCssProperty("qqqqq")).toBeNull();
  });

  it("長さ 4 未満は距離 1 まで", () => {
    expect(suggestCssProperty("gpa")).toBe("gap"); // 隣接転置 = 距離 1
    expect(suggestCssProperty("gxp")).toBe("gap"); // 置換 1
    expect(suggestCssProperty("xyz")).toBeNull();
  });

  it("同距離複数なら先頭一致を優先する(tap → top)", () => {
    // top(先頭 t 一致・距離 1)と gap(先頭不一致・距離 1)の同距離
    expect(suggestCssProperty("tap")).toBe("top");
  });

  it("同距離・同接頭辞なら定義順の先勝ち(overflow-z → overflow-x)", () => {
    expect(suggestCssProperty("overflow-z")).toBe("overflow-x");
  });

  it("空文字列は null", () => {
    expect(suggestCssProperty("")).toBeNull();
    expect(suggestCssProperty("   ")).toBeNull();
  });
});

describe("KNOWN_CSS_PROPERTIES", () => {
  it("80〜120 個に収まっている(判定バンドル同梱のため軽量)", () => {
    expect(KNOWN_CSS_PROPERTIES.size).toBeGreaterThanOrEqual(80);
    expect(KNOWN_CSS_PROPERTIES.size).toBeLessThanOrEqual(120);
  });

  it("教材で使う代表プロパティを含む", () => {
    for (const prop of [
      "color",
      "background-color",
      "font-size",
      "text-align",
      "display",
      "justify-content",
      "align-items",
      "flex-direction",
      "padding",
      "padding-top",
      "margin",
      "margin-left",
      "border",
      "border-radius",
      "border-top-width",
      "width",
      "height",
      "position",
      "line-height",
      "list-style-type",
      "box-shadow",
      "opacity",
      "cursor",
      "gap",
      "row-gap",
      "column-gap",
    ]) {
      expect(KNOWN_CSS_PROPERTIES.has(prop)).toBe(true);
    }
  });

  it("すべて小文字で登録されている", () => {
    for (const prop of KNOWN_CSS_PROPERTIES) {
      expect(prop).toBe(prop.toLowerCase());
    }
  });
});

// ---------------------------------------------------------------------------
// メッセージ様式(全メッセージが「N行目」と修正アクションを含む)
// ---------------------------------------------------------------------------

describe("診断メッセージの様式", () => {
  const brokenHtml = [
    "<h1",
    "<h1 hello</h1>",
    "<h1>hello</h1",
    '<a href="index.html',
    "<h1>hello",
    "</h2>",
    "<b><i>x</b></i>",
    "<p>a</img>",
    "<!-- comment",
    '<a href＝"a.html">x</a>',
  ];
  const brokenCss = [
    "h1 {\n  color: red;\n",
    "}",
    "h1 color: red;",
    "h1 { color red; }",
    "h1 {\n  color: red\n  font-size: 16px;\n}",
    "h1 {\n  color： red;\n}",
    "/* never closed",
  ];

  it("lintHtml の全メッセージが「N行目」を含む", () => {
    for (const source of brokenHtml) {
      const diags = lintHtml(source);
      expect(diags.length).toBeGreaterThanOrEqual(1);
      for (const d of diags) {
        expect(d.message).toMatch(/^\d+行目/);
        expect(d.message).toMatch(new RegExp(`^${d.line}行目`));
      }
    }
  });

  it("lintHtml の全メッセージが修正アクションを含む", () => {
    for (const source of brokenHtml) {
      for (const d of lintHtml(source)) {
        expect(d.message).toMatch(/(ましょう|閉じられていません|がありません)/);
      }
    }
  });

  it("lintCss の全メッセージが「N行目」を含む", () => {
    for (const source of brokenCss) {
      const diags = lintCss(source);
      expect(diags.length).toBeGreaterThanOrEqual(1);
      for (const d of diags) {
        expect(d.message).toMatch(/^\d+行目/);
        expect(d.message).toMatch(new RegExp(`^${d.line}行目`));
      }
    }
  });

  it("lintCss の全メッセージが修正アクションを含む", () => {
    for (const source of brokenCss) {
      for (const d of lintCss(source)) {
        expect(d.message).toMatch(/(ましょう|必要です|閉じられていません)/);
      }
    }
  });
});

describe("lintHtml: タグ名のゴミ文字・終了タグの余計な文字(2026-07-10 実地報告の強化)", () => {
  it("文中の </a, を検出する(報告ケースの一般形: EOF でなくても壊れている)", () => {
    const diags = lintHtml('<body><a href="https://x.com">x</a,>\n</body>');
    expect(diags.length).toBeGreaterThan(0);
    expect(diags[0]?.message).toContain("</a,");
    expect(diags[0]?.message).toContain("とだけ書きましょう");
  });

  it("開始タグ名のゴミ文字 <a,> を検出する", () => {
    const diags = lintHtml("<a,>x</a>");
    expect(diags.length).toBeGreaterThan(0);
    expect(diags[0]?.message).toContain("「,」");
    expect(diags[0]?.message).toContain("<a>");
  });

  it("<h1!> のような開始タグ名も検出する", () => {
    const diags = lintHtml("<h1!>x</h1>");
    expect(diags[0]?.message).toContain("「!」");
  });

  it("終了タグの属性様ゴミ </p ,> を検出する", () => {
    const diags = lintHtml("<p>x</p ,>");
    expect(diags.length).toBe(1);
    expect(diags[0]?.message).toContain("余計な文字");
  });

  it('終了タグに属性 </a href="x"> を書いたら検出する', () => {
    const diags = lintHtml('<a href="https://x.com">x</a href="y">');
    expect(diags.length).toBe(1);
    expect(diags[0]?.message).toContain("</a>");
  });

  it("ゴミ名の終了タグでも対応づけは回復し、連鎖エラーを出さない", () => {
    // </a,> が a を閉じたとみなされ、unclosed-element の連鎖が出ないこと
    const diags = lintHtml("<body><a>x</a,>\n<p>y</p></body>");
    expect(diags.length).toBe(1);
  });

  it("偽陽性なし: 名前の後の空白だけの終了タグ </a > は合法", () => {
    expect(lintHtml("<a>x</a >")).toEqual([]);
  });

  it("偽陽性なし: 大文字タグ・カスタム要素(ハイフン)は合法", () => {
    expect(lintHtml("<DIV>x</DIV>")).toEqual([]);
    expect(lintHtml("<my-widget>x</my-widget>")).toEqual([]);
  });

  it("偽陽性なし: テキスト中の記号は従来どおり無視", () => {
    expect(lintHtml("<p>a, b! c?</p>")).toEqual([]);
  });
});
