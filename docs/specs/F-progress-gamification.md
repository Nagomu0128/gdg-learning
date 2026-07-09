# SPEC F — 進捗・提出・ゲーミフィケーション + 閲覧系ページ

先に読む: DesignDoc §2.5, §7, §9, §10.3, §10.4 → CONTRACTS §5, §6, §10。

## 所有権

`~/features/progress/**`, `~/features/gamification/**`, `~/features/analytics.server.ts`, `routes/{_index,courses._index,courses.$course,me}.tsx`。

## 実装

### 1. progress サービス(CONTRACTS §5 のシグネチャ厳守)

- `submitVerdict`(§9.1, §9.2):
  1. レート制限(§10.4): KV `rl:{userId}` に epoch ms 配列(JSON)。60s window で 30 件以上なら `Response(429)` throw。書き込みは expirationTtl 120s
  2. VerdictPayload を zod 検証(details の checkId は文字列・上限 100 件、code は合計 200KB 上限で切詰めず 400)
  3. lesson_slug が content-meta.json に存在しない → 404
  4. 読み(§9.2): user_stats + lesson_progress
  5. 合格時 db.batch: submissions INSERT(id=ulidx, content_version=meta.contentVersion, code=JSON, details=JSON)+ lesson_progress UPSERT(`onConflictDoUpdate`: status='passed', first_passed_at=既存値優先(初回のみ set — SQL の coalesce), updated_at)+ daily_activity INSERT OR IGNORE(JST 日付)+ user_stats UPSERT(ストリーク規則: last==today→変化なし / last==昨日→+1 / それ以外→1。longest=max。total_passed は**その lesson の初合格時のみ** +1 が自然だが、DesignDoc §9.2 は「total_passed++」= 合格提出ごと。**採用: 初合格時のみ +1**(passed_10 バッジが「合格数の節目」= レッスン数の意図のため)。ADR 追記対象として notes に書くこと)
  6. 不合格時 batch: submissions INSERT + lesson_progress UPSERT(failed_count+1, status 維持 or 'in_progress')
  7. バッジ評価(§9.3): ACHIEVEMENTS を評価 → 新規のみ INSERT OR IGNORE → newBadges(既得は user_achievements SELECT で除外)
  8. Analytics(§10.3): `track(env, "submit"|"pass", {lessonSlug})`
  9. 応答 SubmitResult(CONTRACTS §5)
- ストリーク計算・JST 変換は `jst.ts` に分離し vitest(境界: JST 0時前後 = UTC 15:00、日付跨ぎ、リセット)
- `getExerciseState` / `getCoursesOverview` / `getCourseDetail` / `getMypage` / `markSolutionViewed` / `runRetention`(§7.5: `created_at < now-90d AND code IS NOT NULL` かつ「user×lesson の最新合格提出」を除外する 1 クエリ + バッチ)。すべて content-meta.json を教材メタの正とする(DB に教材テーブルはない — §7.1)
- resume 規則(§2.2): 最初の in_progress レッスン → exercise、なければ最初の not_started → slides/1、全部 passed なら null

### 2. gamification

- `achievements.ts`(クライアント安全): MVP 9 種(§2.5)を defineAchievement 形式の配列で。icon は絵文字。title/description 日本語(例: first_pass「はじめの一歩」)
- 評価 ctx(CONTRACTS §5)組み立てはサーバー側 `evaluate.server.ts`

### 3. ページ(§2.2, §2.6 — 閲覧系はレスポンシブ)

- `_index.tsx`(LP): ヒーロー(SITE_NAME + キャッチ「スライドで学んで、書いて、すぐ判定。」系 + CTA「無料ではじめる」→ ログイン or コース一覧)、特徴 3 カード(スライド学習 / ブラウザ内エディタ / 即時判定)、コース 3 枚カード、フッター。未ログインでも閲覧可
- `courses._index.tsx`: コースカード(タイトル・説明・進捗バー passed/lessonCount・「はじめる/つづける」)
- `courses.$course.tsx`: レッスン一覧(順序番号・タイトル・estMinutes・状態アイコン: ✓ passed / ▶ in_progress / ○ not_started)+ コース進捗バー。クリックで slides/1(passed/in_progress は exercise への直接リンクも)
- `me.tsx`(§2.2, requireUser): 「つづきから」大ボタン(resume)、統計(合格数・現在/最長ストリーク)、バッジグリッド(未獲得はグレー + 条件文)、コース別進捗、**自分の解答**(最新合格コードをレッスンごとにアコーディオン表示 — `<pre><code>` にテキストとして。**エスケープ描画厳守** §10.2)

## 完了条件

typecheck / lint green。`jst.ts`・ストリーク規則・レート制限(KV モック)・retention の対象抽出クエリの vitest(D1 は drizzle の SQLite in-memory か、ロジックを関数分離して判定)。バッジ条件 9 種のユニットテスト。
