# SPEC D — スライド(MDX パイプライン + 紙芝居ルート)

先に読む: DesignDoc §2.1, §4.3, §10.1, §10.5 → CONTRACTS §3.1, §6 → CURRICULUM.md の MDX ルール。

## 所有権

`~/features/slides/**`, `routes/courses.$course.$lesson.slides.$n.tsx`, `app/scripts/codegen/slides.ts`, `app/mdx.config.ts`。

## 実装

1. **MDX ビルド(§4.3)**: `mdx.config.ts` に @mdx-js/rollup のオプションを実装 — `providerImportSource: "@mdx-js/react"`, rehypePlugins: [@shikijs/rehype(テーマ: github-light 系、ビルド時ハイライト — クライアントに Shiki を載せない)]。remark-gfm を使う場合は deps_needed に(scaffold が未導入なら)
2. **codegen/slides.ts**: `content/courses/*/lessons/*/slides/NN.mdx` を `app/app/generated/slides/{lessonSlug}/NN.mdx` へコピーし、`generated/slides.client.ts` に `loadSlide(lessonSlug, n)` レジストリ(import.meta.glob、遅延)を生成。スライド枚数は B の content-meta.json が持つ(B と重複計測しない — こちらはコピーとレジストリのみ)。content が空でも空レジストリで正常終了
3. **MDXComponents**: `~/features/slides/mdx-components.tsx` — h1〜h3/p/ul/ol/li/code/pre/table 等に Tailwind の読みやすいスタイル(スライド文脈: 大きめフォント、行間広め)。`<Callout type="info"|"warn">` 実装。コードブロックは Shiki の出力をそのまま(pre 内 overflow-x-auto)
4. **スライドルート**(§2.1, §2.2): loader は CONTRACTS §6 のとおり(content-meta.json から slideCount 等を解決。$n が 1..slideCount 外なら 404 でなく端へ redirect)。UI:
   - 紙芝居: 中央カード(最大幅 ~3xl)にスライド本文、下部に「← 前へ」「次へ →」+ 進捗ドット(n/slideCount)
   - キーボード ←→(§10.5)。フォーカスが input 系にある時は無視
   - 最終スライド: 「次へ」の代わりに「演習へすすむ →」(exercise へリンク)。1 枚目の「前へ」はレッスン一覧へ
   - **次スライドのプリフェッチ**(§2.1): `loadSlide(slug, n+1)` を useEffect で先読み + `<Link prefetch="intent">`
   - ヘッダー下にパンくず(コース名 → レッスン名)とスライド位置。「スライドに戻る」導線用に URL 規約は exercise 側と共有
   - スライド本文は `loadSlide` の Suspense/lazy 描画(レッスン単位チャンク — §10.1)
5. **プレースホルダ対応**: content 未生成でも route がクラッシュしない(該当スライドなし → 404)

## 完了条件

typecheck / lint / 自分のテスト(あれば)green。フィクスチャ MDX(自作の 2 枚)を `scripts/codegen/__fixtures__/` に置いて codegen 単体テストを 1 本以上。
