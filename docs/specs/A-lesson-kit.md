# SPEC A — lesson-kit 純粋ロジック実装 + 網羅テスト

先に読む: DesignDoc §5.3〜§5.6, §6.6 → CONTRACTS §2 → 既存の `packages/lesson-kit/src/*`。

## 所有権

`packages/lesson-kit/src/` の `{messages,normalize,zenkaku,loop-protect,limits}.ts` と `src/**/*.test.ts`。
**`types.ts` / `define.ts` / `schemas.ts` / `index.ts` は読み取り専用**(公開シグネチャは契約)。バグを見つけたら contract_gaps で報告(軽微な型エラー修正のみ可)。

## やること

1. **loop-protect.ts の本実装**(現状は `// STUB` のパススルー):
   - acorn(ecmaVersion: "latest")で parse。失敗時: エラー位置(acorn の `loc`)→ `diagnoseJsParseError` → ヒットすれば全角診断、なければ `generalSyntaxErrorMessage(line)`(§5.4)
   - 成功時: `for` / `while` / `do-while` / `for-of` / `for-in` の**本体**に脱出カウンタを注入(CodePen 方式 — §6.6)。実装方針: AST を走査(acorn-walk)して各ループノードの位置を収集し、**文字列スプライシング**(後ろから挿入)で ①ループ直前に `let __lc<N> = 0;`(スコープ安全のため IIFE 内や block 内でも動くよう `var` か直前文として適切に)②本体先頭に `if (++__lc<N> > <max>) throw new Error("__LOOP_LIMIT_EXCEEDED__");` を挿入。本体がブロックでない単文(`while(x) i++;`)はブロック化。ネスト・ラベル付きループ・`for(;;)` も正しく扱う
   - 変換後コードも parse 可能であることをテストで保証
2. **zenkaku.ts の強化**: 既存 v1 実装をベースに、§5.4 の要求(偽陽性ゼロ側に倒す)をテストで固める。特に「本文テキスト・文字列リテラル内の全角を**誤検出しない**」ケース(`<p>(全角の)本文</p>`、`console.log("こんにちは、世界!")` など)。MARKUP_LIKE_PATTERNS の調整可
3. **messages.ts / normalize.ts**: 実装済み。テストで §5.2 の既定メッセージ例・§5.3 の正規化仕様(`red`→computed 比較は app 側なので対象外。テキスト正規化・NaN・console 照合)を網羅
4. **テスト**(vitest, `src/*.test.ts`): 目安 80 ケース以上
   - instrumentLoops: 各ループ種別で `while(true){}` が 10 万回で throw / 正常ループは無影響(`new Function` で実行して検証)/ 単文本体 / ネスト / ラベル / for-of / 構文エラー→行番号 / 全角混入構文エラー→全角診断 / 文字列内 `while` 文字列が壊れない
   - zenkaku: 全対象文字 / 位置(line/column)/ 診断文言の形式(「N行目に全角の「＜」が入っています。半角の「<」に直しましょう」)/ 偽陽性ゼロ系
   - normalize: trim・連続空白・exact・ignoreCase・pattern / deepEqualWithNaN(NaN, ネスト, 配列, null vs undefined)/ consoleLinesMatch(ordered 部分列・非 ordered 多重集合)
   - schemas(読み取り専用だがテストは書く): 正常系 / slug 不正 / shorthand 拒否 / solution 欠落 / check id 重複 / custom message 必須

## 完了条件

`pnpm -F @codesteps/lesson-kit typecheck` / `pnpm -F @codesteps/lesson-kit test` / `pnpm exec biome check packages/lesson-kit/src` すべて green。
