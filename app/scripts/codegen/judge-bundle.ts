// 判定バンドルのビルド(DesignDoc §4.2、CONTRACTS §3.3、SPEC B §4)。
// レッスンごとに「checks(lesson.ts)+ 判定ランタイム」を esbuild で IIFE 1 本に束ねる。
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_RUNTIME_PATH = path.resolve(HERE, "../../app/features/judge/runtime/runtime.ts");

/** 判定バンドルに入ってはならない依存(SPEC B §2: zod / acorn 禁止) */
const FORBIDDEN_INPUTS: RegExp[] = [
  /[\\/]node_modules[\\/]zod[\\/]/,
  /[\\/]node_modules[\\/]acorn[\\/]/,
  /[\\/]node_modules[\\/]acorn-walk[\\/]/,
  /lesson-kit[\\/]src[\\/](schemas|loop-protect)\.ts$/,
];

export type JudgeBundleResult = { code: string; bytes: number };

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

/**
 * lesson.ts の絶対パスを受け取り、IIFE の判定バンドル文字列を返す。
 * 実行すると `globalThis.__JUDGE__ = { start, startWorker }` が定義される(CONTRACTS §3.3)。
 */
export async function buildJudgeBundle(
  lessonTsPath: string,
  opts?: { runtimePath?: string },
): Promise<JudgeBundleResult> {
  const runtimePath = opts?.runtimePath ?? DEFAULT_RUNTIME_PATH;
  const lessonDir = path.dirname(lessonTsPath);
  // resolveDir = レッスンのディレクトリ。import 指定子は POSIX 区切りの相対パスにする(Windows 対応)
  const lessonSpec = "./lesson.ts";
  const runtimeSpec = toPosix(path.relative(lessonDir, runtimePath));
  const contents = [
    `import def from ${JSON.stringify(lessonSpec)};`,
    `import { createJudgeRuntime } from ${JSON.stringify(runtimeSpec.startsWith(".") ? runtimeSpec : `./${runtimeSpec}`)};`,
    "createJudgeRuntime(def);",
    "",
  ].join("\n");

  const result = await build({
    stdin: {
      contents,
      resolveDir: lessonDir,
      sourcefile: "judge-entry.ts",
      loader: "ts",
    },
    bundle: true,
    format: "iife",
    minify: true,
    target: "es2020",
    platform: "browser",
    write: false,
    metafile: true,
    logLevel: "silent",
  });

  // metafile.inputs は「解決された全モジュール」で、tree-shake で 0 byte になったものも含む。
  // 実際に出力へバイトを寄与した inputs(outputs[].inputs)だけを検査する。
  const contributing = Object.values(result.metafile.outputs).flatMap((output) =>
    Object.entries(output.inputs)
      .filter(([, info]) => info.bytesInOutput > 0)
      .map(([input]) => input),
  );
  const forbidden = contributing.filter((input) => FORBIDDEN_INPUTS.some((re) => re.test(input)));
  if (forbidden.length > 0) {
    throw new Error(
      `判定バンドルに禁止依存(zod / acorn)が混入しています: ${toPosix(lessonTsPath)} ← ${forbidden.join(", ")}`,
    );
  }

  const output = result.outputFiles[0];
  if (output === undefined) {
    throw new Error(`判定バンドルの出力が空です: ${toPosix(lessonTsPath)}`);
  }
  return { code: output.text, bytes: Buffer.byteLength(output.text, "utf8") };
}
