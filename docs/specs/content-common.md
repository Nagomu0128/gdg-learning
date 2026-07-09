# SPEC content-common — 教材著者(G1/G2/H1/H2/I1/I2)共通仕様

先に読む: DesignDoc §2.1, §2.7, §4.1, §5.2〜§5.4 → CONTRACTS §2 → **CURRICULUM.md(全ルール + 担当レッスンの行)**。

担当レッスン範囲は起動プロンプトで指定される。所有権は `content/courses/{course}/lessons/{NN}-{topic}/**` のみ(course.ts は読み取り専用)。

## 各レッスンの構成

```
lessons/03-links/
  lesson.ts        # defineLesson(default export)
  slides/01.mdx    # 3〜5枚。ファイル名は 01.mdx, 02.mdx, ...(ゼロ埋め2桁)
  slides/02.mdx
  assets/cat.svg   # 必要なら(SVG テキストのみ。バイナリ禁止)
```

## lesson.ts の書き方

```ts
import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-03-links",            // CURRICULUM.md と一字一句一致
  title: "リンクをはろう",
  estMinutes: 5,                     // 3〜8 目安
  files: {
    "index.html": {
      initial: "<!doctype html>\n<html>\n...\n<!-- ここに a タグでリンクを書こう -->\n...",
    },
  },
  checks: [ /* 存在 → 内容 → 仕上げ の順(表示は最初の失敗1件) */ ],
  hints: [
    "リンクは <a> タグで作ります。href 属性に飛び先の URL を書きます",
    "<a href=\"URL\">表示する文字</a> の形です",
  ],
  solution: {
    "index.html": "...完成コード...",
  },
});
```

## 品質基準(自己検証必須)

1. **solution は全 checks に合格する**こと(§4.4 で機械検証される)。提出前に**頭の中で全 check を solution に対して逐一評価**し、結果を確信すること。特に:
   - text check は textContent(子孫込み)を正規化(trim + 連続空白→1)して比較
   - element の count は「厳密一致」。solution に余分な同種タグを書かない
   - console check は log/info のみ対象・正規化後の完全一致。`console.log("合計:", 300)` → `"合計: 300"`
   - fn check の対象は **function 宣言**。solution も必ず function 宣言で書く
   - style check の期待値は px / キーワード / 色名・hex(computed 解決で表記ゆれは吸収されるが、% や em は禁止)。property は longhand のみ(padding-top ○ / padding ×)。**CSS の solution では check 対象プロパティを必ず宣言**
   - DOM に暗黙生成される html/head/body を element check にしない(source check を使う)
2. **initial は「その一歩だけ」書けば合格できる状態**に(§2.7 の 写経/穴埋め/自力 指定に従う)。コメントで書く場所を誘導(`<!-- ここに〜 -->` / `// ここに〜`)
3. スライド(MDX): 表紙(このレッスンで学ぶこと)→ 概念説明(コード例つき)→ 書き方の型 → まとめ/やってみよう。1 枚 = 1 トピック(Mayer のセグメント化 — §2.1)。です/ます調、初学者向け、専門語には短い補足。コード例のタグ・記号は必ず半角。使える構文: 標準 Markdown + ```html/css/js フェンス + `<Callout type="info"|"warn">`。**import 文・独自コンポーネント・HTML 直書きは禁止**
4. hints: 2〜3 個(考え方 → 形 → ほぼ答え)。answer 丸写しは最後の 1 個だけ
5. 文言はすべて日本語。絵文字は使わない(スライドの Callout 内は可)

## 検証コマンド

```
pnpm -F @codesteps/content typecheck
pnpm exec biome check content/courses/<担当ディレクトリ>
```

codegen 検証(`pnpm validate:content`)は B の実装後に統合フェーズで走る。zod スキーマ(packages/lesson-kit/src/schemas.ts)を読み、制約(hints>=1、custom は message 必須、など)を守ること。
