// git-sim 公開 API(教材の custom check から使う判定用述語 — docs/specs/content-common-2.md)。
// 決定的(同一入力 → 同一状態・同一ハッシュ)。判定バンドルに同梱されるため依存ゼロ。
// プレビュー用レンダラ(render.ts の renderPlayback)はここから re-export しない:
// 判定バンドルに DOM 生成コードを入れないため(vendor バンドルのみが含める)。

import { Engine, type TranscriptEntry } from "./engine";
import { diffTrees, firstParentChain, headCommitHash, headTree, isAncestorHash, resolveRef } from "./repo";

export type { TranscriptEntry };

export class GitSim {
  private readonly engine: Engine;
  /** setup スクリプト分を除いた、ユーザースクリプトの transcript 開始位置 */
  private readonly userStart: number;

  private constructor(engine: Engine, userStart: number) {
    this.engine = engine;
    this.userStart = userStart;
  }

  /**
   * setup スクリプト(レッスンの初期状態シード。出力は transcript に含めない)を流してから
   * ユーザースクリプトを実行したインスタンスを返す。
   */
  static fromScripts(setupScript: string, userScript: string): GitSim {
    const engine = new Engine();
    engine.runScript(setupScript);
    const userStart = engine.entries.length;
    engine.runScript(userScript);
    return new GitSim(engine, userStart);
  }

  // ---- transcript(プレビュー再生・出力検証用) ----

  /** ユーザースクリプト分の実行記録 */
  transcript(): TranscriptEntry[] {
    return this.engine.entries.slice(this.userStart);
  }

  /** 最後のコマンドの出力(ユーザースクリプトが空なら "") */
  lastOutput(): string {
    const entries = this.transcript();
    return entries[entries.length - 1]?.output ?? "";
  }

  /** ユーザースクリプトにエラーになったコマンドがあるか */
  hasErrors(): boolean {
    return this.transcript().some((e) => e.error);
  }

  // ---- 状態クエリ(判定用述語) ----

  branches(): string[] {
    return [...this.engine.repo.branches.keys()].sort();
  }

  currentBranch(): string | null {
    const head = this.engine.repo.head;
    return head.kind === "branch" ? head.name : null;
  }

  branchExists(name: string): boolean {
    return this.engine.repo.branches.has(name);
  }

  /** ref(省略時 HEAD)から第1親をたどったコミットメッセージ(新しい順) */
  log(ref = "HEAD"): string[] {
    const hash = resolveRef(this.engine.repo, ref);
    if (hash === null) return [];
    return firstParentChain(this.engine.repo, hash).map((c) => c.message);
  }

  commitCount(ref = "HEAD"): number {
    return this.log(ref).length;
  }

  headHash(): string | null {
    return headCommitHash(this.engine.repo);
  }

  /** ワーキングディレクトリのファイル内容(なければ null) */
  fileContent(path: string): string | null {
    return this.engine.repo.workdir.get(path) ?? null;
  }

  workdirFiles(): string[] {
    return [...this.engine.repo.workdir.keys()].sort();
  }

  /** ステージ済み(HEAD と差分がある index エントリ)のファイル名 */
  stagedFiles(): string[] {
    const repo = this.engine.repo;
    const diff = diffTrees(headTree(repo), repo.index);
    return [...diff.added, ...diff.modified, ...diff.deleted].sort();
  }

  /** a のコミットが b に取り込まれているか(a が b の祖先または同一) */
  isMerged(a: string, b: string): boolean {
    const repo = this.engine.repo;
    const hashA = resolveRef(repo, a);
    const hashB = resolveRef(repo, b);
    if (hashA === null || hashB === null) return false;
    return isAncestorHash(repo, hashA, hashB);
  }

  isAncestor(a: string, b: string): boolean {
    return this.isMerged(a, b);
  }

  /** ref から到達可能な履歴にマージコミット(親2つ)が無いか */
  isLinearHistory(ref = "HEAD"): boolean {
    const repo = this.engine.repo;
    const hash = resolveRef(repo, ref);
    if (hash === null) return false;
    const seen = new Set<string>();
    const queue = [hash];
    while (queue.length > 0) {
      const current = queue.pop();
      if (current === undefined || seen.has(current)) continue;
      seen.add(current);
      const commit = repo.commits.get(current);
      if (commit === undefined) continue;
      if (commit.parents.length > 1) return false;
      queue.push(...commit.parents);
    }
    return true;
  }

  /** "origin/main" または "main" 形式でリモート(origin の実体)にブランチがあるか */
  remoteBranchExists(name: string): boolean {
    const short = name.startsWith("origin/") ? name.slice("origin/".length) : name;
    return this.engine.repo.remote.has(short);
  }

  /** リモート(origin の実体)のブランチのコミットメッセージ(新しい順) */
  remoteLog(ref: string): string[] {
    const short = ref.startsWith("origin/") ? ref.slice("origin/".length) : ref;
    const hash = this.engine.repo.remote.get(short);
    if (hash === undefined) return [];
    return firstParentChain(this.engine.repo, hash).map((c) => c.message);
  }

  /** ワーキングファイルにコンフリクトマーカーが残っているか */
  hasConflictMarkers(path: string): boolean {
    const content = this.fileContent(path);
    if (content === null) return false;
    return content.includes("<<<<<<<") || content.includes("=======") || content.includes(">>>>>>>");
  }

  /** 未コミットの変更・未追跡ファイル・進行中の merge/rebase が無いか */
  isClean(): boolean {
    const repo = this.engine.repo;
    if (repo.pending !== null) return false;
    const staged = diffTrees(headTree(repo), repo.index);
    if (staged.added.length + staged.modified.length + staged.deleted.length > 0) return false;
    const work = diffTrees(repo.index, repo.workdir);
    return work.added.length + work.modified.length + work.deleted.length === 0;
  }

  isMerging(): boolean {
    return this.engine.repo.pending?.kind === "merge";
  }

  isRebasing(): boolean {
    return this.engine.repo.pending?.kind === "rebase";
  }

  /** `git log --graph` 相当の簡易グラフ(全ブランチ + HEAD。プレビュー再生でも使用) */
  logGraph(): string {
    const repo = this.engine.repo;
    const from = [...repo.branches.values()];
    const head = headCommitHash(repo);
    if (head !== null) from.push(head);
    return this.engine.logGraph(from);
  }
}
