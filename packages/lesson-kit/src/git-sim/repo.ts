// git-sim のリポジトリモデル(DesignDoc ADR #21 / docs/specs/L-runtime.md)。
// 純 TS・依存ゼロ・決定的: 時刻は論理クロック(seq)、ハッシュは FNV-1a(hash.ts)。
// 判定バンドルに同梱されるため、DOM / zod / acorn には一切依存しないこと。

import { shortHash } from "./hash";

// ツリー直列化の区切り(ファイル名・内容と衝突しない制御文字。エスケープで埋め込む)
const FIELD_SEP = String.fromCharCode(0);
const ENTRY_SEP = String.fromCharCode(1);

/** ファイル名 → 内容(コミットツリー / ワーキングディレクトリ / ステージング共通) */
export type Tree = Map<string, string>;

export type Commit = {
  hash: string;
  /** 第1親が「元いた側」。マージコミットのみ 2 要素 */
  parents: string[];
  message: string;
  tree: Tree;
  /** 論理クロック(作成順)。log の表示順・merge-base の選択に使う */
  seq: number;
};

export type Head = { kind: "branch"; name: string } | { kind: "detached"; hash: string };

/** merge / rebase --abort 用の巻き戻しスナップショット */
export type Snapshot = {
  head: Head;
  branches: [string, string][];
  workdir: [string, string][];
  index: [string, string][];
};

export type PendingMerge = {
  kind: "merge";
  theirsHash: string;
  /** コンフリクトマーカー >>>>>>> に書くラベル(ブランチ名 / origin/main) */
  label: string;
  message: string;
  /** 未解決(まだ git add されていない)コンフリクトファイル */
  conflicts: Set<string>;
  snapshot: Snapshot;
};

export type PendingRebase = {
  kind: "rebase";
  /** これから再適用するコミット(古い順)。先頭がコンフリクト中の 1 件 */
  todo: Commit[];
  /** 再適用済みの先端(次の親になるハッシュ) */
  onto: string;
  branch: string;
  conflicts: Set<string>;
  snapshot: Snapshot;
};

export class Repo {
  initialized = false;
  seq = 0;
  /** ローカル・リモート共有のオブジェクトストア(hash → Commit) */
  commits = new Map<string, Commit>();
  branches = new Map<string, string>();
  head: Head = { kind: "branch", name: "main" };
  workdir: Tree = new Map();
  index: Tree = new Map();
  /** リモート origin の実体(bare リポジトリ相当。ブランチ名 → hash) */
  remote = new Map<string, string>();
  /** fetch / push / pull で更新されるリモート追跡参照(ブランチ名 → hash) */
  remoteRefs = new Map<string, string>();
  /** ブランチ → 追跡するリモートブランチ名(push -u で設定) */
  upstreams = new Map<string, string>();
  stash: { workdir: Tree; index: Tree }[] = [];
  pending: PendingMerge | PendingRebase | null = null;
}

export function cloneTree(tree: Tree): Tree {
  return new Map(tree);
}

export function treesEqual(a: Tree, b: Tree): boolean {
  if (a.size !== b.size) return false;
  for (const [name, content] of a) {
    if (b.get(name) !== content) return false;
  }
  return true;
}

export type TreeDiff = { added: string[]; modified: string[]; deleted: string[] };

/** base → target の変更(ファイル名昇順で決定的) */
export function diffTrees(base: Tree, target: Tree): TreeDiff {
  const added: string[] = [];
  const modified: string[] = [];
  const deleted: string[] = [];
  const names = [...new Set([...base.keys(), ...target.keys()])].sort();
  for (const name of names) {
    const before = base.get(name);
    const after = target.get(name);
    if (before === undefined && after !== undefined) added.push(name);
    else if (before !== undefined && after === undefined) deleted.push(name);
    else if (before !== after) modified.push(name);
  }
  return { added, modified, deleted };
}

export function headCommitHash(repo: Repo): string | null {
  if (repo.head.kind === "detached") return repo.head.hash;
  return repo.branches.get(repo.head.name) ?? null;
}

export function headTree(repo: Repo): Tree {
  const hash = headCommitHash(repo);
  if (hash === null) return new Map();
  const commit = repo.commits.get(hash);
  return commit === undefined ? new Map() : commit.tree;
}

/** コミットを作成してストアに登録する(ハッシュは決定的。万一の衝突は salt で回避) */
export function createCommit(repo: Repo, message: string, tree: Tree, parents: string[]): Commit {
  repo.seq += 1;
  const treeText = [...tree.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([name, content]) => [name, content].join(FIELD_SEP))
    .join(ENTRY_SEP);
  let salt = 0;
  let hash = shortHash(`${parents.join(",")}\n${message}\n${treeText}\n${repo.seq}`);
  while (repo.commits.has(hash)) {
    salt += 1;
    hash = shortHash(`${parents.join(",")}\n${message}\n${treeText}\n${repo.seq}\n${salt}`);
  }
  const commit: Commit = { hash, parents, message, tree: cloneTree(tree), seq: repo.seq };
  repo.commits.set(hash, commit);
  return commit;
}

/** hash から到達可能な全コミット(自身を含む) */
export function ancestors(repo: Repo, hash: string): Set<string> {
  const seen = new Set<string>();
  const queue = [hash];
  while (queue.length > 0) {
    const current = queue.pop();
    if (current === undefined || seen.has(current)) continue;
    const commit = repo.commits.get(current);
    if (commit === undefined) continue;
    seen.add(current);
    queue.push(...commit.parents);
  }
  return seen;
}

/** a が b の祖先(または同一)か */
export function isAncestorHash(repo: Repo, a: string, b: string): boolean {
  return ancestors(repo, b).has(a);
}

/** 共通祖先のうち論理クロック最大のもの(3-way マージの base) */
export function mergeBase(repo: Repo, a: string, b: string): Commit | null {
  const ofA = ancestors(repo, a);
  let best: Commit | null = null;
  for (const hash of ancestors(repo, b)) {
    if (!ofA.has(hash)) continue;
    const commit = repo.commits.get(hash);
    if (commit !== undefined && (best === null || commit.seq > best.seq)) best = commit;
  }
  return best;
}

/** 第1親をたどる線形の履歴(新しい順)。log / commitCount 用 */
export function firstParentChain(repo: Repo, hash: string): Commit[] {
  const chain: Commit[] = [];
  const seen = new Set<string>();
  let current: string | undefined = hash;
  while (current !== undefined && !seen.has(current)) {
    seen.add(current);
    const commit: Commit | undefined = repo.commits.get(current);
    if (commit === undefined) break;
    chain.push(commit);
    current = commit.parents[0];
  }
  return chain;
}

/** 到達可能な全コミットを論理クロック降順で(log --graph / 全件表示用) */
export function reachableCommits(repo: Repo, fromHashes: string[]): Commit[] {
  const seen = new Set<string>();
  for (const hash of fromHashes) {
    for (const h of ancestors(repo, hash)) seen.add(h);
  }
  const commits: Commit[] = [];
  for (const hash of seen) {
    const commit = repo.commits.get(hash);
    if (commit !== undefined) commits.push(commit);
  }
  return commits.sort((x, y) => y.seq - x.seq);
}

/**
 * ref 文字列の解決: "HEAD" / "HEAD~N" / ブランチ名 / "origin/x" / ハッシュ前方一致(4文字以上)。
 * 解決できなければ null。
 */
export function resolveRef(repo: Repo, ref: string): string | null {
  const trimmed = ref.trim();
  if (trimmed === "" || trimmed === "HEAD") return headCommitHash(repo);
  const tilde = /^HEAD(~+)(\d*)$/.exec(trimmed);
  if (tilde !== null) {
    const tildes = tilde[1] ?? "~";
    const digits = tilde[2] ?? "";
    const n = digits === "" ? tildes.length : tildes.length - 1 + Number.parseInt(digits, 10);
    let hash = headCommitHash(repo);
    for (let i = 0; i < n && hash !== null; i++) {
      hash = repo.commits.get(hash)?.parents[0] ?? null;
    }
    return hash;
  }
  const local = repo.branches.get(trimmed);
  if (local !== undefined) return local;
  if (trimmed.startsWith("origin/")) {
    const name = trimmed.slice("origin/".length);
    return repo.remoteRefs.get(name) ?? repo.remote.get(name) ?? null;
  }
  if (/^[0-9a-f]{4,}$/.test(trimmed)) {
    const matches = [...repo.commits.keys()].filter((h) => h.startsWith(trimmed));
    if (matches.length === 1) return matches[0] ?? null;
  }
  return null;
}

export function takeSnapshot(repo: Repo): Snapshot {
  return {
    head: repo.head.kind === "branch" ? { kind: "branch", name: repo.head.name } : { ...repo.head },
    branches: [...repo.branches.entries()],
    workdir: [...repo.workdir.entries()],
    index: [...repo.index.entries()],
  };
}

export function restoreSnapshot(repo: Repo, snapshot: Snapshot): void {
  repo.head =
    snapshot.head.kind === "branch" ? { kind: "branch", name: snapshot.head.name } : { ...snapshot.head };
  repo.branches = new Map(snapshot.branches);
  repo.workdir = new Map(snapshot.workdir);
  repo.index = new Map(snapshot.index);
}
