// 契約型定義(docs/specs/CONTRACTS.md §2)。シグネチャ変更禁止。

export type FileMap = Record<string, string>;

export type ConsoleLevel = "log" | "info" | "warn" | "error";
export type ConsoleEntry = { level: ConsoleLevel; text: string };

export type VerdictDetail = { checkId: string; passed: boolean };

/** 判定エンジンの結果(DesignDoc §5.1) */
export type Verdict = {
  passed: boolean;
  /** 表示する最初の失敗。合格時は null */
  display: { checkId: string; message: string } | null;
  /** 全チェックの結果(記録用) */
  details: VerdictDetail[];
  console: ConsoleEntry[];
  timedOut: boolean;
};

export type CustomCheckContext = {
  document: Document;
  window: Window & typeof globalThis;
  /** selector の最初の要素へ bubbles:true でイベントを dispatch(click は MouseEvent) */
  fire: (selector: string, event: string) => void;
  wait: (ms: number) => Promise<void>;
  console: ConsoleEntry[];
};

type CheckBase = { id: string; message?: string };

export type ElementCheck = CheckBase & {
  type: "element";
  selector: string;
  /** 指定時は一致数が厳密一致、未指定時は 1 個以上 */
  count?: number;
};

export type TextCheck = CheckBase & {
  type: "text";
  selector: string;
  equals?: string;
  contains?: string;
  /** RegExp ソース文字列 */
  pattern?: string;
  flags?: string;
  /** true で正規化(trim + 連続空白畳み)を無効化 */
  exact?: boolean;
  ignoreCase?: boolean;
};

export type AttributeCheck = CheckBase & {
  type: "attribute";
  selector: string;
  name: string;
  equals?: string;
  exists?: boolean;
};

export type StyleCheck = CheckBase & {
  type: "style";
  selector: string;
  /** longhand プロパティ限定(schemas.ts の SHORTHAND_BLOCKLIST で強制) */
  property: string;
  equals: string;
};

export type SourceCheck = CheckBase & {
  type: "source";
  /** files のキー */
  file: string;
  /** RegExp ソース文字列 */
  pattern: string;
  flags?: string;
};

export type ConsoleCheck = CheckBase & {
  type: "console";
  lines: string[];
  /** true なら lines が出力の部分列(順序保存)であること */
  ordered?: boolean;
};

export type FnCheck = CheckBase & {
  type: "fn";
  /** globalThis 上の function 宣言名 */
  name: string;
  args: unknown[];
  /** deepEqualWithNaN で比較(非同期関数は await 後) */
  returns: unknown;
};

export type CustomCheck = {
  id: string;
  /** custom は既定メッセージを生成できないため必須 */
  message: string;
  type: "custom";
  run: (ctx: CustomCheckContext) => boolean | Promise<boolean>;
};

export type Check =
  | ElementCheck
  | TextCheck
  | AttributeCheck
  | StyleCheck
  | SourceCheck
  | ConsoleCheck
  | FnCheck
  | CustomCheck;

export type CheckType = Check["type"];

export type RunnerKind = "dom" | "worker";

export type LessonFile = {
  initial: string;
  /** 既定 true。false はエディタで鍵付き読み取り専用 */
  editable?: boolean;
  /** 実行には含めるがタブに出さない(採点用の土台等) */
  hidden?: boolean;
};

/** 教材定義(DesignDoc §4.1) */
export type LessonDef = {
  /** 公開後は不変(安定識別子)。URL・DB 外部キー相当を兼ねる */
  slug: string;
  title: string;
  estMinutes?: number;
  /** 省略時: DOM 系 check(element/text/attribute/style/custom)が 1 つでもあれば "dom" */
  runner?: RunnerKind;
  files: Record<string, LessonFile>;
  /** 上から評価し、表示は最初の失敗 1 件(§5.1) */
  checks: Check[];
  hints: string[];
  solution: Record<string, string>;
};

export type CourseLevel = "basic" | "intermediate" | "advanced" | "capstone";

export type CourseDef = {
  slug: string;
  title: string;
  description: string;
  /** コース一覧・content-meta.json 内の表示順(昇順)。未指定は末尾(slug 順) */
  order?: number;
  /** 難度レベル(ADR #19)。UI のセクション分けとバッジ導出に使う。未指定は "basic" */
  level?: CourseLevel;
  /** レッスン slug の順序付きリスト */
  lessons: string[];
};
