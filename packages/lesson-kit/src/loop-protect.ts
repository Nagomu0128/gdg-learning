// ループ保護(DesignDoc §6.6)— acorn で parse し for/while/do-while/for-of/for-in に脱出カウンタを注入。
// app のメインスレッドでのみ実行(判定バンドルには入らない)。
//
// 実装方針(docs/specs/A-lesson-kit.md):
//   AST を走査してループ位置を収集し、文字列スプライシングで
//   ①ループ(ラベル連鎖ごと)をブロックで包んで先頭に `let __lc<N> = 0;` を置き
//   ②本体先頭に脱出カウンタの guard を挿入する。
//   ブロックで包むため if の単文本体などどの文位置でも構文が壊れず、
//   `continue label` のためラベルはループ側に残す。カウンタはループ再入場のたびに 0 に戻る。

import type {
  AnyNode,
  DoWhileStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  Program,
  WhileStatement,
} from "acorn";
import { parse } from "acorn";
import { ancestor } from "acorn-walk";
import { LOOP_MAX_ITERATIONS } from "./limits";
import { diagnoseJsParseError, generalSyntaxErrorMessage } from "./zenkaku";

export type SyntaxDiag = { line: number; message: string };

export type InstrumentResult = { ok: true; code: string } | { ok: false; error: SyntaxDiag };

/** カウンタ超過時に throw される専用エラーの message(ランナーはこれを見て LOOP_LIMIT_MESSAGE_JP に変換) */
export const LOOP_PROTECT_ERROR_MESSAGE = "__LOOP_LIMIT_EXCEEDED__";
export const LOOP_LIMIT_MESSAGE_JP = "無限ループになっていませんか? ループの回数が上限を超えました";

type LoopNode = ForStatement | WhileStatement | DoWhileStatement | ForOfStatement | ForInStatement;

const LOOP_TYPES: ReadonlySet<string> = new Set([
  "ForStatement",
  "WhileStatement",
  "DoWhileStatement",
  "ForOfStatement",
  "ForInStatement",
]);

// kind: 0 = close(挿入位置で何かを閉じる)/ 1 = open(挿入位置から何かを開く)。
// 同一位置では close を先に、close 同士は深い方から、open 同士は浅い方から並べる。
type Edit = { pos: number; kind: 0 | 1; depth: number; text: string };

function compareEdits(a: Edit, b: Edit): number {
  if (a.pos !== b.pos) return a.pos - b.pos;
  if (a.kind !== b.kind) return a.kind - b.kind;
  return a.kind === 0 ? b.depth - a.depth : a.depth - b.depth;
}

export function instrumentLoops(source: string, opts?: { maxIterations?: number }): InstrumentResult {
  const max = Math.floor(opts?.maxIterations ?? LOOP_MAX_ITERATIONS);

  let program: Program;
  try {
    program = parse(source, { ecmaVersion: "latest", sourceType: "script" });
  } catch (e) {
    const loc = (e as { loc?: { line?: number; column?: number } }).loc;
    const line = typeof loc?.line === "number" && loc.line >= 1 ? loc.line : 1;
    const column = typeof loc?.column === "number" ? loc.column : 0;
    const zenkaku = diagnoseJsParseError(source, { line, column });
    if (zenkaku) return { ok: false, error: zenkaku };
    return { ok: false, error: { line, message: generalSyntaxErrorMessage(line) } };
  }

  const loops: { node: LoopNode; ancestors: AnyNode[] }[] = [];
  const record = (node: LoopNode, _state: unknown, ancestors: AnyNode[]) => {
    loops.push({ node, ancestors: ancestors.slice() });
  };
  ancestor(program, {
    ForStatement: record,
    WhileStatement: record,
    DoWhileStatement: record,
    ForInStatement: record,
    ForOfStatement: record,
  });

  if (loops.length === 0) return { ok: true, code: source };

  const edits: Edit[] = [];
  loops.forEach(({ node, ancestors }, n) => {
    // ancestors の末尾は node 自身。囲んでいるループ数 = ネスト深度(同一位置挿入の順序決定に使用)
    const depth = ancestors.reduce(
      (acc, a, i) => (i < ancestors.length - 1 && LOOP_TYPES.has(a.type) ? acc + 1 : acc),
      0,
    );

    // ラベル連鎖(`outer: for(...)`)は `continue outer` を壊さないよう連鎖ごとブロックで包む
    let idx = ancestors.length - 1;
    while (idx > 0) {
      const parent = ancestors[idx - 1];
      if (parent !== undefined && parent.type === "LabeledStatement" && parent.body === ancestors[idx]) {
        idx--;
      } else {
        break;
      }
    }
    const wrapTarget = ancestors[idx] as AnyNode;

    const guard = `if (++__lc${n} > ${max}) throw new Error(${JSON.stringify(LOOP_PROTECT_ERROR_MESSAGE)});`;
    edits.push({ pos: wrapTarget.start, kind: 1, depth, text: `{ let __lc${n} = 0; ` });
    const body = node.body;
    if (body.type === "BlockStatement") {
      edits.push({ pos: body.start + 1, kind: 1, depth: depth + 0.25, text: ` ${guard}` });
    } else {
      // 単文・空文の本体はブロック化して guard を先頭に置く
      edits.push({ pos: body.start, kind: 1, depth: depth + 0.5, text: `{ ${guard} ` });
      edits.push({ pos: body.end, kind: 0, depth: depth + 0.5, text: ` }` });
    }
    edits.push({ pos: wrapTarget.end, kind: 0, depth, text: ` }` });
  });

  edits.sort(compareEdits);

  let out = "";
  let last = 0;
  for (const edit of edits) {
    out += source.slice(last, edit.pos) + edit.text;
    last = edit.pos;
  }
  out += source.slice(last);
  return { ok: true, code: out };
}
