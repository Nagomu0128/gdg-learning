# SPEC E — 演習画面(エディタ / プレビュー / 提出 / クリア演出)

**ユーザー体験の中核。** 先に読む: DesignDoc §2.3, §2.4, §2.6, §5.1, §6.2, §10.5 → CONTRACTS §3.2, §6.1, §7。

## 所有権

`~/features/editor/**`, `~/features/exercise/**`, `routes/courses.$course.$lesson.exercise.tsx`。

## 前提(他エージェントの契約に依存 — スタブ相手に型で組む)

- 判定: `judge` / `composePreview` / `runWorkerConsole`(CONTRACTS §3.2。B 実装)
- レッスンデータ: `loadLesson(slug)`(generated。クライアント側で遅延 import — §10.1)
- サーバー状態: loader で `getExerciseState`、action で `submitVerdict` / `markSolutionViewed`(F 実装)
- lesson-kit: `findZenkakuSpaces` / `findZenkakuChars`(エディタ lint)

## 実装

### 1. ルート

- loader: `requireUser` → `{ user, courseSlug, lessonSlug, lessonTitle, exercise: ExerciseState, nextLessonSlug: string | null, slideCount }`(content-meta.json + F のサービス)
- action: CONTRACTS §6.1(intent=submit / view-solution。zod でパース、submitVerdict の 429 はそのまま返し UI でトースト表示)
- クライアント: `loadLesson` を clientLoader か useEffect + Suspense で取得(SSR には載せない — CodeMirror も client-only)

### 2. エディタ(`~/features/editor/`)

- CodeMirror 6 ラッパー `<CodeEditor file={name} value onChange readOnly>`: 言語は拡張子で lang-html/css/javascript。**自動補完なし**(ADR #11 — autocompletion を入れない。closeBrackets は可)。行番号・折返しなし・タブ幅 2
- 全角 lint 拡張(`zenkaku-extension.ts`): ①全角スペース背景ハイライト(Decoration.mark, 常時)②`findZenkakuChars` の警告(linter() で severity "warning"、メッセージは hit.suggestion を使った日本語)— §5.4 の「ブロックしない予防装置」
- ファイルタブ: hidden 除外。`editable:false` は 🔒 表示 + readOnly。アクティブタブ切替でエディタ内容スワップ(state は FileMap 一元管理)
- 下書き(§2.3): localStorage `draft:{lessonSlug}` へ 1s デバウンス保存 `{files, savedAt}`。マウント時に draft ?? initial。「リセット」ボタン: confirm → initial に戻し draft 削除

### 3. 3ペインレイアウト(§2.3)

- 左(手順): レッスンタイトル、指示文(初期コードのコメント誘導が主 — スライド最終枚の要約として `hints` とは別に meta から出せる情報のみで構成)、「スライドをもう一度見る」リンク(slides/1)、ヒント欄(§2.4: `unlockedHintCount` 分だけ開放表示、残りは「あと N 回挑戦でヒントが開きます」)、「答えを見る」ボタン(solutionAvailable まで disabled、押下で view-solution POST + solution モーダル表示(読み取り専用・エスケープ描画))
- 中央: ファイルタブ + CodeEditor + (JS 含むレッスンのみ)「▶ 実行」ボタン
- 右: タブ「あなたの結果 / 見本 / コンソール」+ 判定メッセージ欄(下部固定, `aria-live="polite"`)
  - あなたの結果: dom 系 → `composePreview(現在の files)` の iframe(`sandbox="allow-scripts"` のみ!)。HTML/CSS は 300ms デバウンス反映、JS は「実行」or Ctrl/Cmd+Enter でのみ反映(§2.3)。worker 系 → コンソール出力ビュー(`runWorkerConsole`, 実行ボタンで更新)
  - 見本(§2.3 ADR #15): dom 系 → `composePreview(solution ライブ)`。worker 系 → solution の `runWorkerConsole` 出力
  - コンソール: preview:console postMessage(nonce 照合)を蓄積表示。level 色分け。syntax エラー時は composePreview の jsSyntaxError を表示
  - 新規タブで開く: 合成 HTML → `new Blob([html], {type:"text/html"})` → URL.createObjectURL → window.open
- 下部バー: リセット / 答えを見る / **「できた!」**(primary, 提出)
- md 未満(§2.6): 3ペインを「手順 / コード / プレビュー」のタブ切替に

### 4. 提出フロー(§9.1)

「できた!」→ judge(lesson, 実行対象 files) → fetcher.submit(intent=submit, verdict={passed,timedOut,details}, code=編集可能ファイルの FileMap)。**合否問わず毎回 POST**(ADR #4)。
- 不合格: 判定メッセージ欄に display.message を 1 件だけ(§2.1)。ヒント開放数は action 応答の unlockedHintCount で即時更新
- 合格: `<ClearScreen>` オーバーレイ(§2.1 ピークエンド): 「クリア!」大見出し + ストリーク表示(extended なら「🔥 N日連続!」演出)+ newBadges のカード(獲得演出)→ 「次のレッスンへ」(nextLessonSlug あれば slides/1 へ、なければコース一覧)+ 「このまま続ける」。CSS アニメーション(prefers-reduced-motion 尊重)
- 判定中はボタン disabled + スピナー。judge の例外は「判定に失敗しました。もう一度お試しください」

### 5. アクセシビリティ(§10.5)

判定メッセージ aria-live、タブは role=tablist、モーダルフォーカストラップ、全操作キーボード可。

## 完了条件

typecheck / lint green。zenkaku-extension とドラフト保存ロジックの vitest(DOM 依存部は関数分離して node でテスト)。UI の実挙動は統合フェーズで検証される前提で、スタブ相手でもクラッシュしない null ガードを入れること。
