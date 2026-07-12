// git-sim のコマンドエンジン(行指向スクリプトの実行)。
// 出力は本物の git に雰囲気を寄せた簡潔な日本語(学習用)。未知コマンドはエラーを
// transcript に残して続行する(1 行のミスで以降が全部無言になるのを防ぐ)。

import {
  type Commit,
  cloneTree,
  createCommit,
  diffTrees,
  firstParentChain,
  headCommitHash,
  headTree,
  isAncestorHash,
  mergeBase,
  type PendingMerge,
  type PendingRebase,
  Repo,
  reachableCommits,
  resolveRef,
  restoreSnapshot,
  type Tree,
  takeSnapshot,
  treesEqual,
} from "./repo";

export type TranscriptEntry = { command: string; output: string; error: boolean };

type Result = { output: string; error?: boolean };

const NOT_A_REPO = "Gitリポジトリではありません(先に git init を実行しましょう)";

function ok(output = ""): Result {
  return { output };
}

function fail(output: string): Result {
  return { output, error: true };
}

/** ダブル / シングルクォートを解釈し、`>` / `>>` を独立トークンに切り出す */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  const push = (): void => {
    if (current !== "") {
      tokens.push(current);
      current = "";
    }
  };
  for (const ch of line) {
    if (quote !== null) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === " " || ch === "\t") {
      push();
      continue;
    }
    if (ch === ">") {
      if (current !== ">" && current !== "") push();
      current += ch;
      if (current === ">>") push();
      continue;
    }
    if (current === ">") push();
    current += ch;
  }
  push();
  return tokens;
}

/** コンフリクトマーカー付きの本文を作る(ours = HEAD 側、theirs = 取り込む側) */
function conflictBody(ours: string, theirs: string, label: string): string {
  const trim = (s: string): string => s.replace(/\n$/, "");
  return `<<<<<<< HEAD\n${trim(ours)}\n=======\n${trim(theirs)}\n>>>>>>> ${label}\n`;
}

/** 行単位の LCS で最小限の unified 風 diff を作る */
function diffLines(before: string, after: string): string[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  // dp[i][j] = a[i:] と b[j:] の LCS 長
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    const row = dp[i];
    const next = dp[i + 1];
    if (row === undefined || next === undefined) continue;
    for (let j = m - 1; j >= 0; j--) {
      row[j] = a[i] === b[j] ? (next[j + 1] ?? 0) + 1 : Math.max(next[j] ?? 0, row[j + 1] ?? 0);
    }
  }
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push(`  ${a[i]}`);
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      out.push(`- ${a[i]}`);
      i++;
    } else {
      out.push(`+ ${b[j]}`);
      j++;
    }
  }
  while (i < n) out.push(`- ${a[i++]}`);
  while (j < m) out.push(`+ ${b[j++]}`);
  return out;
}

export class Engine {
  readonly repo = new Repo();
  readonly entries: TranscriptEntry[] = [];

  /** 行指向スクリプトを実行する。空行・`#` 始まりの行はスキップ */
  runScript(script: string): void {
    for (const raw of script.split(/\r?\n/)) {
      const line = raw.trim();
      if (line === "" || line.startsWith("#")) continue;
      this.runLine(line);
    }
  }

  runLine(line: string): void {
    const tokens = tokenize(line);
    const name = tokens[0];
    let result: Result;
    if (name === undefined) {
      result = ok();
    } else if (name === "git") {
      result = this.git(tokens.slice(1));
    } else if (name === "echo") {
      result = this.echo(tokens.slice(1));
    } else if (name === "cat") {
      result = this.cat(tokens.slice(1));
    } else if (name === "ls") {
      result = this.ls();
    } else if (name === "touch") {
      result = this.touch(tokens.slice(1));
    } else {
      result = fail(`${name}: コマンドが見つかりません`);
    }
    this.entries.push({ command: line, output: result.output, error: result.error === true });
  }

  // ---- シェルコマンド(conflict 解消と状態確認に必要な最小限) ----

  private echo(args: string[]): Result {
    const redirectAt = args.findIndex((t) => t === ">" || t === ">>");
    if (redirectAt === -1) return ok(args.join(" "));
    const target = args[redirectAt + 1];
    if (target === undefined) return fail("echo: リダイレクト先のファイル名がありません");
    const text = `${args.slice(0, redirectAt).join(" ")}\n`;
    const previous = args[redirectAt] === ">>" ? (this.repo.workdir.get(target) ?? "") : "";
    this.repo.workdir.set(target, previous + text);
    return ok();
  }

  private cat(args: string[]): Result {
    const name = args[0];
    if (name === undefined) return fail("cat: ファイル名を指定してください");
    const content = this.repo.workdir.get(name);
    if (content === undefined) return fail(`cat: ${name}: そのようなファイルはありません`);
    return ok(content.replace(/\n$/, ""));
  }

  private ls(): Result {
    const names = [...this.repo.workdir.keys()].sort();
    return ok(names.join("  "));
  }

  private touch(args: string[]): Result {
    const name = args[0];
    if (name === undefined) return fail("touch: ファイル名を指定してください");
    if (!this.repo.workdir.has(name)) this.repo.workdir.set(name, "");
    return ok();
  }

  // ---- git コマンド ----

  private git(args: string[]): Result {
    const sub = args[0];
    if (sub === undefined) return fail("git: サブコマンドを指定してください(例: git status)");
    if (sub === "init") return this.gitInit();
    if (!this.repo.initialized) return fail(NOT_A_REPO);
    const rest = args.slice(1);
    switch (sub) {
      case "status":
        return this.gitStatus();
      case "add":
        return this.gitAdd(rest);
      case "commit":
        return this.gitCommit(rest);
      case "log":
        return this.gitLog(rest);
      case "branch":
        return this.gitBranch(rest);
      case "switch":
        return this.gitSwitch(rest, "switch");
      case "checkout":
        return this.gitSwitch(rest, "checkout");
      case "merge":
        return this.gitMerge(rest);
      case "rebase":
        return this.gitRebase(rest);
      case "push":
        return this.gitPush(rest);
      case "pull":
        return this.gitPull(rest);
      case "fetch":
        return this.gitFetch();
      case "diff":
        return this.gitDiff(rest);
      case "reset":
        return this.gitReset(rest);
      case "revert":
        return this.gitRevert(rest);
      case "stash":
        return this.gitStash(rest);
      default:
        return fail(`git: '${sub}' はこのシミュレータでは対応していないコマンドです`);
    }
  }

  private gitInit(): Result {
    if (this.repo.initialized) return ok("既に Git リポジトリです(初期化済み)");
    this.repo.initialized = true;
    this.repo.head = { kind: "branch", name: "main" };
    return ok("空の Git リポジトリを作成しました(ブランチ: main)");
  }

  private currentBranchName(): string | null {
    return this.repo.head.kind === "branch" ? this.repo.head.name : null;
  }

  private gitStatus(): Result {
    const repo = this.repo;
    const lines: string[] = [];
    const branch = this.currentBranchName();
    lines.push(
      branch !== null ? `ブランチ ${branch}` : `HEAD は ${headCommitHash(repo) ?? "?"} で分離しています`,
    );
    if (repo.pending !== null) {
      const action = repo.pending.kind === "merge" ? "マージ" : "リベース";
      lines.push(`${action}の途中です`);
      if (repo.pending.conflicts.size > 0) {
        lines.push("未解決のコンフリクト(解決して git add しましょう):");
        for (const name of [...repo.pending.conflicts].sort()) lines.push(`\tboth modified: ${name}`);
      } else {
        lines.push(
          repo.pending.kind === "merge"
            ? "コンフリクトは解決済みです(git commit で完了します)"
            : "コンフリクトは解決済みです(git rebase --continue で続行します)",
        );
      }
    }
    const staged = diffTrees(headTree(repo), repo.index);
    const stagedLines: string[] = [
      ...staged.added.map((n) => `\tnew file: ${n}`),
      ...staged.modified.map((n) => `\tmodified: ${n}`),
      ...staged.deleted.map((n) => `\tdeleted: ${n}`),
    ];
    if (stagedLines.length > 0) {
      lines.push("コミット予定の変更(ステージ済み):", ...stagedLines);
    }
    const unstagedLines: string[] = [];
    for (const [name, content] of [...this.repo.index.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
      const inWork = repo.workdir.get(name);
      if (inWork === undefined) unstagedLines.push(`\tdeleted: ${name}`);
      else if (inWork !== content) unstagedLines.push(`\tmodified: ${name}`);
    }
    if (unstagedLines.length > 0) {
      lines.push("ステージされていない変更(git add で追加できます):", ...unstagedLines);
    }
    const untracked = [...repo.workdir.keys()].filter((n) => !repo.index.has(n)).sort();
    if (untracked.length > 0) {
      lines.push("未追跡のファイル(git add で追加できます):", ...untracked.map((n) => `\t${n}`));
    }
    if (
      stagedLines.length === 0 &&
      unstagedLines.length === 0 &&
      untracked.length === 0 &&
      repo.pending === null
    ) {
      lines.push(
        headCommitHash(repo) === null
          ? "まだコミットがありません"
          : "コミットするものはありません。作業ツリーはきれいな状態です",
      );
    }
    return ok(lines.join("\n"));
  }

  private gitAdd(args: string[]): Result {
    if (args.length === 0) return fail("git add: 追加するファイルを指定してください(例: git add ファイル名)");
    const repo = this.repo;
    if (args.includes(".") || args.includes("-A") || args.includes("--all")) {
      repo.index = cloneTree(repo.workdir);
      repo.pending?.conflicts.clear();
      return ok();
    }
    for (const name of args) {
      const content = repo.workdir.get(name);
      if (content === undefined)
        return fail(`git add: pathspec '${name}' はどのファイルとも一致しませんでした`);
      repo.index.set(name, content);
      repo.pending?.conflicts.delete(name);
    }
    return ok();
  }

  private gitCommit(args: string[]): Result {
    const repo = this.repo;
    let message: string | null = null;
    const flagAt = args.indexOf("-m");
    if (flagAt !== -1) {
      message = args[flagAt + 1] ?? null;
      if (message === null)
        return fail('git commit: -m の後にメッセージを書きましょう(例: git commit -m "説明")');
    }
    if (repo.pending?.kind === "rebase") {
      return fail("リベースの途中です。git add のあと git rebase --continue で続行しましょう");
    }
    if (repo.pending?.kind === "merge") {
      const pending = repo.pending;
      if (pending.conflicts.size > 0) {
        return fail(
          `コンフリクトが未解決です: ${[...pending.conflicts].sort().join(", ")}\nファイルを直して git add してから commit しましょう`,
        );
      }
      const commit = createCommit(repo, message ?? pending.message, repo.index, [
        headCommitHash(repo) ?? "",
        pending.theirsHash,
      ]);
      this.moveHead(commit.hash);
      repo.pending = null;
      const branch = this.currentBranchName() ?? "HEAD";
      return ok(`[${branch} ${commit.hash}] ${commit.message}\nマージを完了しました`);
    }
    if (message === null) {
      return fail('git commit: メッセージが必要です(例: git commit -m "変更の説明")');
    }
    if (treesEqual(repo.index, headTree(repo))) {
      return fail("コミットする変更がありません(git add を忘れていませんか?)");
    }
    const parent = headCommitHash(repo);
    const commit = createCommit(repo, message, repo.index, parent === null ? [] : [parent]);
    this.moveHead(commit.hash);
    const branch = this.currentBranchName() ?? "HEAD";
    const changes = diffTrees(
      parent === null ? new Map() : (repo.commits.get(parent)?.tree ?? new Map()),
      commit.tree,
    );
    const count = changes.added.length + changes.modified.length + changes.deleted.length;
    return ok(`[${branch} ${commit.hash}] ${message}\n ${count} ファイルを変更`);
  }

  /** HEAD(ブランチ先端 or detached)を hash へ進める */
  private moveHead(hash: string): void {
    if (this.repo.head.kind === "branch") this.repo.branches.set(this.repo.head.name, hash);
    else this.repo.head = { kind: "detached", hash };
  }

  private decorations(hash: string): string {
    const repo = this.repo;
    const names: string[] = [];
    const current = this.currentBranchName();
    for (const [name, h] of [...repo.branches.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
      if (h !== hash) continue;
      names.push(name === current ? `HEAD -> ${name}` : name);
    }
    for (const [name, h] of [...repo.remoteRefs.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
      if (h === hash) names.push(`origin/${name}`);
    }
    // HEAD -> を先頭へ
    names.sort((a, b) => Number(b.startsWith("HEAD")) - Number(a.startsWith("HEAD")));
    return names.length > 0 ? ` (${names.join(", ")})` : "";
  }

  private gitLog(args: string[]): Result {
    const repo = this.repo;
    const head = headCommitHash(repo);
    if (head === null) return fail("まだコミットがありません");
    if (args.includes("--graph")) return ok(this.logGraph([...repo.branches.values(), head]));
    const chain = firstParentChain(repo, head);
    if (args.includes("--oneline")) {
      return ok(chain.map((c) => `${c.hash}${this.decorations(c.hash)} ${c.message}`).join("\n"));
    }
    return ok(chain.map((c) => `commit ${c.hash}${this.decorations(c.hash)}\n    ${c.message}`).join("\n"));
  }

  /**
   * `git log --graph` 相当の簡易ブランチグラフ。
   * レーン割当のみ行い、接続線(|\ など)は省略した学習用の簡易表示。
   */
  logGraph(fromHashes: string[]): string {
    const repo = this.repo;
    const commits = reachableCommits(repo, fromHashes);
    if (commits.length === 0) return "(コミットはまだありません)";
    const lanes: (string | null)[] = [];
    const lines: string[] = [];
    for (const commit of commits) {
      let lane = lanes.findIndex((h) => h === commit.hash);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(commit.hash);
      }
      const markers = lanes.map((h, i) => (i === lane ? "*" : h !== null ? "|" : " "));
      lines.push(`${markers.join(" ")} ${commit.hash}${this.decorations(commit.hash)} ${commit.message}`);
      lanes[lane] = commit.parents[0] ?? null;
      for (const parent of commit.parents.slice(1)) {
        if (!lanes.includes(parent)) lanes.push(parent);
      }
      // 同じ親を待つレーンを畳む(分岐点で合流)
      for (let i = 0; i < lanes.length; i++) {
        const h = lanes[i];
        if (h === null) continue;
        for (let j = i + 1; j < lanes.length; j++) {
          if (lanes[j] === h) lanes[j] = null;
        }
      }
      while (lanes.length > 0 && lanes[lanes.length - 1] === null) lanes.pop();
    }
    return lines.join("\n");
  }

  private gitBranch(args: string[]): Result {
    const repo = this.repo;
    if (args[0] === "-d" || args[0] === "-D") {
      const name = args[1];
      if (name === undefined) return fail("git branch -d: 削除するブランチ名を指定してください");
      const hash = repo.branches.get(name);
      if (hash === undefined) return fail(`ブランチ '${name}' は存在しません`);
      if (name === this.currentBranchName()) return fail(`今いるブランチ '${name}' は削除できません`);
      const head = headCommitHash(repo);
      if (args[0] === "-d" && head !== null && !isAncestorHash(repo, hash, head)) {
        return fail(`ブランチ '${name}' はまだマージされていません(取り込んでから削除しましょう)`);
      }
      repo.branches.delete(name);
      return ok(`ブランチ ${name} を削除しました(was ${hash})`);
    }
    const name = args[0];
    if (name === undefined) {
      const current = this.currentBranchName();
      const names = [...repo.branches.keys()].sort();
      if (names.length === 0) return ok("(ブランチはまだありません。最初のコミットで main ができます)");
      return ok(names.map((n) => (n === current ? `* ${n}` : `  ${n}`)).join("\n"));
    }
    if (repo.branches.has(name)) return fail(`ブランチ '${name}' は既に存在します`);
    const head = headCommitHash(repo);
    if (head === null) return fail("まだコミットがありません(最初のコミットの後にブランチを作れます)");
    repo.branches.set(name, head);
    return ok();
  }

  private gitSwitch(args: string[], style: "switch" | "checkout"): Result {
    const repo = this.repo;
    const createFlag = style === "switch" ? "-c" : "-b";
    let create = false;
    let name: string | undefined;
    if (args[0] === createFlag) {
      create = true;
      name = args[1];
    } else {
      name = args[0];
    }
    if (name === undefined) return fail(`git ${style}: ブランチ名を指定してください`);
    if (repo.pending !== null) {
      return fail("マージ / リベースの途中はブランチを切り替えられません(--abort で中断できます)");
    }
    if (create) {
      if (repo.branches.has(name)) return fail(`ブランチ '${name}' は既に存在します`);
      const head = headCommitHash(repo);
      if (head === null) return fail("まだコミットがありません(最初のコミットの後にブランチを作れます)");
      repo.branches.set(name, head);
      repo.head = { kind: "branch", name };
      return ok(`新しいブランチ '${name}' に切り替えました`);
    }
    const target = repo.branches.get(name);
    if (target === undefined) return fail(`ブランチ '${name}' は存在しません(git branch で確認できます)`);
    // 追跡ファイルに未コミットの変更があれば切り替えを止める(教材では commit / stash を促す)
    const staged = diffTrees(headTree(repo), repo.index);
    const dirtyStaged = staged.added.length + staged.modified.length + staged.deleted.length > 0;
    let dirtyWork = false;
    for (const [file, content] of repo.index) {
      if (repo.workdir.get(file) !== content) dirtyWork = true;
    }
    if (dirtyStaged || dirtyWork) {
      return fail("未コミットの変更があります。git commit するか git stash で退避してから切り替えましょう");
    }
    const untracked = [...repo.workdir.entries()].filter(([n]) => !repo.index.has(n));
    const tree = repo.commits.get(target)?.tree ?? new Map<string, string>();
    repo.head = { kind: "branch", name };
    repo.workdir = cloneTree(tree);
    for (const [n, content] of untracked) repo.workdir.set(n, content);
    repo.index = cloneTree(tree);
    return ok(`ブランチ '${name}' に切り替えました`);
  }

  /** ours(HEAD ツリー)へ theirs を 3-way マージ。conflict ファイル一覧を返す */
  private threeWayMerge(
    base: Tree,
    ours: Tree,
    theirs: Tree,
    label: string,
  ): { tree: Tree; conflicts: string[] } {
    const names = [...new Set([...base.keys(), ...ours.keys(), ...theirs.keys()])].sort();
    const tree: Tree = new Map();
    const conflicts: string[] = [];
    for (const name of names) {
      const b = base.get(name);
      const o = ours.get(name);
      const t = theirs.get(name);
      if (o === t) {
        if (o !== undefined) tree.set(name, o);
      } else if (b === o) {
        if (t !== undefined) tree.set(name, t);
      } else if (b === t) {
        if (o !== undefined) tree.set(name, o);
      } else {
        conflicts.push(name);
        tree.set(name, conflictBody(o ?? "", t ?? "", label));
      }
    }
    return { tree, conflicts };
  }

  /** merge / pull 共通のマージ本体 */
  private mergeInto(theirsHash: string, label: string): Result {
    const repo = this.repo;
    const head = headCommitHash(repo);
    if (head === null) return fail("まだコミットがありません");
    if (!this.isCleanTree()) {
      return fail("未コミットの変更があります。git commit してからマージしましょう");
    }
    if (isAncestorHash(repo, theirsHash, head)) return ok("既に最新です(Already up to date)");
    const theirsTree = repo.commits.get(theirsHash)?.tree ?? new Map<string, string>();
    if (isAncestorHash(repo, head, theirsHash)) {
      // fast-forward
      this.moveHead(theirsHash);
      repo.workdir = cloneTree(theirsTree);
      repo.index = cloneTree(theirsTree);
      return ok(`更新 ${head}..${theirsHash}\nFast-forward(早送りマージ)`);
    }
    const base = mergeBase(repo, head, theirsHash);
    const message = `Merge branch '${label}'`;
    const snapshot = takeSnapshot(repo);
    const merged = this.threeWayMerge(base?.tree ?? new Map(), headTree(repo), theirsTree, label);
    if (merged.conflicts.length > 0) {
      repo.workdir = merged.tree;
      const index: Tree = new Map();
      for (const [name, content] of merged.tree) {
        if (!merged.conflicts.includes(name)) index.set(name, content);
      }
      repo.index = index;
      const pending: PendingMerge = {
        kind: "merge",
        theirsHash,
        label,
        message,
        conflicts: new Set(merged.conflicts),
        snapshot,
      };
      repo.pending = pending;
      return fail(
        `コンフリクト: ${merged.conflicts.join(", ")} を自動マージできませんでした\nファイルを直して git add → git commit で解決しましょう(やめるときは git merge --abort)`,
      );
    }
    const commit = createCommit(repo, message, merged.tree, [head, theirsHash]);
    this.moveHead(commit.hash);
    repo.workdir = cloneTree(merged.tree);
    repo.index = cloneTree(merged.tree);
    return ok(`マージコミット ${commit.hash} を作成しました(${message})`);
  }

  private gitMerge(args: string[]): Result {
    const repo = this.repo;
    if (args[0] === "--abort") {
      if (repo.pending?.kind !== "merge") return fail("中断できるマージがありません");
      restoreSnapshot(repo, repo.pending.snapshot);
      repo.pending = null;
      return ok("マージを中断し、元の状態に戻しました");
    }
    if (repo.pending !== null) return fail("マージ / リベースの途中です(git status で状態を確認しましょう)");
    const name = args[0];
    if (name === undefined) return fail("git merge: 取り込むブランチ名を指定してください");
    const theirs = resolveRef(repo, name);
    if (theirs === null) return fail(`ブランチ '${name}' は存在しません`);
    return this.mergeInto(theirs, name);
  }

  private gitRebase(args: string[]): Result {
    const repo = this.repo;
    if (args[0] === "--abort") {
      if (repo.pending?.kind !== "rebase") return fail("中断できるリベースがありません");
      restoreSnapshot(repo, repo.pending.snapshot);
      repo.pending = null;
      return ok("リベースを中断し、元の状態に戻しました");
    }
    if (args[0] === "--continue") {
      if (repo.pending?.kind !== "rebase") return fail("続行できるリベースがありません");
      const pending = repo.pending;
      if (pending.conflicts.size > 0) {
        return fail(
          `コンフリクトが未解決です: ${[...pending.conflicts].sort().join(", ")}\nファイルを直して git add してから --continue しましょう`,
        );
      }
      // conflict していたコミットを、解決後の index ツリーで作り直して続行
      const current = pending.todo[0];
      if (current === undefined) return fail("続行できるリベースがありません");
      const replayed = createCommit(repo, current.message, repo.index, [pending.onto]);
      pending.onto = replayed.hash;
      pending.todo = pending.todo.slice(1);
      return this.rebaseLoop(pending);
    }
    if (repo.pending !== null) return fail("マージ / リベースの途中です(git status で状態を確認しましょう)");
    const name = args[0];
    if (name === undefined) return fail("git rebase: 乗せ替え先のブランチ名を指定してください");
    const ontoHash = resolveRef(repo, name);
    if (ontoHash === null) return fail(`ブランチ '${name}' は存在しません`);
    const branch = this.currentBranchName();
    if (branch === null) return fail("ブランチにいる状態で rebase しましょう");
    const head = headCommitHash(repo);
    if (head === null) return fail("まだコミットがありません");
    if (!this.isCleanTree()) return fail("未コミットの変更があります。git commit してから rebase しましょう");
    if (isAncestorHash(repo, head, ontoHash)) {
      // 自分の先が全部向こうにある → fast-forward と同じ
      this.moveHead(ontoHash);
      const tree = repo.commits.get(ontoHash)?.tree ?? new Map<string, string>();
      repo.workdir = cloneTree(tree);
      repo.index = cloneTree(tree);
      return ok(`${branch} を ${name} に早送りしました`);
    }
    if (isAncestorHash(repo, ontoHash, head)) return ok("既に最新です(rebase の必要はありません)");
    const base = mergeBase(repo, head, ontoHash);
    // 第1親チェーン上の「自分だけのコミット」を古い順に再適用する
    const chain = firstParentChain(repo, head);
    const todo: Commit[] = [];
    for (const commit of chain) {
      if (base !== null && commit.hash === base.hash) break;
      todo.push(commit);
    }
    todo.reverse();
    const pending: PendingRebase = {
      kind: "rebase",
      todo,
      onto: ontoHash,
      branch,
      conflicts: new Set(),
      snapshot: takeSnapshot(repo),
    };
    return this.rebaseLoop(pending);
  }

  /** todo を順に再適用する。conflict で停止、完走でブランチ付け替え */
  private rebaseLoop(pending: PendingRebase): Result {
    const repo = this.repo;
    let count = 0;
    while (true) {
      const commit = pending.todo[0];
      if (commit === undefined) break;
      const parentHash = commit.parents[0];
      const parentTree =
        parentHash === undefined
          ? new Map<string, string>()
          : (repo.commits.get(parentHash)?.tree ?? new Map<string, string>());
      const ontoTree = repo.commits.get(pending.onto)?.tree ?? new Map<string, string>();
      const merged = this.threeWayMerge(parentTree, ontoTree, commit.tree, commit.message);
      if (merged.conflicts.length > 0) {
        repo.workdir = merged.tree;
        const index: Tree = new Map();
        for (const [name, content] of merged.tree) {
          if (!merged.conflicts.includes(name)) index.set(name, content);
        }
        repo.index = index;
        pending.conflicts = new Set(merged.conflicts);
        repo.pending = pending;
        return fail(
          `コンフリクト: ${merged.conflicts.join(", ")} を自動マージできませんでした("${commit.message}" の適用中)\nファイルを直して git add → git rebase --continue で続行しましょう(やめるときは git rebase --abort)`,
        );
      }
      const replayed = createCommit(repo, commit.message, merged.tree, [pending.onto]);
      pending.onto = replayed.hash;
      pending.todo = pending.todo.slice(1);
      count += 1;
    }
    repo.branches.set(pending.branch, pending.onto);
    repo.head = { kind: "branch", name: pending.branch };
    const tree = repo.commits.get(pending.onto)?.tree ?? new Map<string, string>();
    repo.workdir = cloneTree(tree);
    repo.index = cloneTree(tree);
    repo.pending = null;
    return ok(
      `${pending.branch} を付け替えました(rebase 完了${count > 0 ? `: ${count} 個のコミットを再適用` : ""})`,
    );
  }

  private gitPush(args: string[]): Result {
    const repo = this.repo;
    const rest = args.filter((a) => a !== "-u" && a !== "--set-upstream");
    const setUpstream = rest.length !== args.length;
    let branchName: string | undefined;
    if (rest.length >= 2 && rest[0] === "origin") branchName = rest[1];
    else if (rest.length === 0) {
      const current = this.currentBranchName();
      if (current === null) return fail("ブランチにいる状態で push しましょう");
      if (!repo.upstreams.has(current)) {
        return fail(
          `ブランチ '${current}' に上流がありません。git push -u origin ${current} で設定しましょう`,
        );
      }
      branchName = current;
    } else if (rest[0] !== "origin") {
      return fail("git push: リモートは origin のみ対応です(例: git push origin main)");
    }
    if (branchName === undefined)
      return fail("git push: ブランチ名を指定してください(例: git push origin main)");
    const local = repo.branches.get(branchName);
    if (local === undefined) return fail(`ブランチ '${branchName}' は存在しません`);
    const remoteHash = repo.remote.get(branchName);
    if (remoteHash !== undefined && remoteHash !== local && !isAncestorHash(repo, remoteHash, local)) {
      return fail(
        `拒否されました: origin/${branchName} が先に進んでいます。先に git pull で取り込みましょう`,
      );
    }
    const isNew = remoteHash === undefined;
    if (remoteHash === local) return ok("既に最新です(Everything up-to-date)");
    repo.remote.set(branchName, local);
    repo.remoteRefs.set(branchName, local);
    if (setUpstream) repo.upstreams.set(branchName, branchName);
    const detail = isNew
      ? ` * [new branch] ${branchName} -> ${branchName}`
      : `   ${remoteHash}..${local}  ${branchName} -> ${branchName}`;
    const upstreamNote = setUpstream
      ? `\nブランチ '${branchName}' が origin/${branchName} を追跡するようになりました`
      : "";
    return ok(`To origin\n${detail}${upstreamNote}`);
  }

  private gitFetch(): Result {
    const repo = this.repo;
    const updated: string[] = [];
    for (const [name, hash] of [...repo.remote.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
      if (repo.remoteRefs.get(name) !== hash) {
        repo.remoteRefs.set(name, hash);
        updated.push(`   origin/${name} を更新しました`);
      }
    }
    return ok(updated.length > 0 ? `origin から取得しました\n${updated.join("\n")}` : "既に最新です");
  }

  private gitPull(args: string[]): Result {
    const repo = this.repo;
    let branchName: string | undefined;
    if (args.length >= 2 && args[0] === "origin") branchName = args[1];
    else if (args.length === 0) {
      const current = this.currentBranchName();
      if (current === null) return fail("ブランチにいる状態で pull しましょう");
      branchName = repo.upstreams.get(current);
      if (branchName === undefined) {
        return fail(
          `ブランチ '${current}' に上流がありません。git pull origin ${current} のように指定しましょう`,
        );
      }
    } else {
      return fail("git pull: リモートは origin のみ対応です(例: git pull origin main)");
    }
    if (branchName === undefined) return fail("git pull: ブランチ名を指定してください");
    const remoteHash = repo.remote.get(branchName);
    if (remoteHash === undefined) return fail(`origin に '${branchName}' はありません`);
    repo.remoteRefs.set(branchName, remoteHash);
    const merged = this.mergeInto(remoteHash, `origin/${branchName}`);
    return { output: `origin から取得しました\n${merged.output}`, error: merged.error };
  }

  private gitDiff(args: string[]): Result {
    const repo = this.repo;
    const staged = args.includes("--staged") || args.includes("--cached");
    const base = staged ? headTree(repo) : repo.index;
    const target = staged ? repo.index : repo.workdir;
    const changes = diffTrees(base, target);
    // git diff(無印)は未追跡ファイルを表示しない
    const files = staged
      ? [...changes.added, ...changes.modified, ...changes.deleted].sort()
      : [...changes.modified, ...changes.deleted].sort();
    const out: string[] = [];
    for (const name of files) {
      out.push(`--- a/${name}`, `+++ b/${name}`, ...diffLines(base.get(name) ?? "", target.get(name) ?? ""));
    }
    return ok(out.join("\n"));
  }

  private gitReset(args: string[]): Result {
    const repo = this.repo;
    const mode = args[0];
    if (mode !== "--hard" && mode !== "--soft") {
      return fail("git reset: --hard か --soft を指定してください(例: git reset --hard HEAD~1)");
    }
    const ref = args[1] ?? "HEAD";
    const target = resolveRef(repo, ref);
    if (target === null) return fail(`'${ref}' を解決できませんでした`);
    const commit = repo.commits.get(target);
    if (commit === undefined) return fail(`'${ref}' を解決できませんでした`);
    this.moveHead(target);
    if (mode === "--hard") {
      repo.workdir = cloneTree(commit.tree);
      repo.index = cloneTree(commit.tree);
      repo.pending = null;
    }
    return ok(`HEAD は ${commit.hash}(${commit.message})になりました`);
  }

  private gitRevert(args: string[]): Result {
    const repo = this.repo;
    if (args[0] !== "HEAD") return fail("git revert: このシミュレータは git revert HEAD のみ対応です");
    const head = headCommitHash(repo);
    if (head === null) return fail("まだコミットがありません");
    if (!this.isCleanTree()) return fail("未コミットの変更があります。git commit してから revert しましょう");
    const commit = repo.commits.get(head);
    if (commit === undefined) return fail("HEAD を解決できませんでした");
    const parentHash = commit.parents[0];
    const parentTree =
      parentHash === undefined
        ? new Map<string, string>()
        : (repo.commits.get(parentHash)?.tree ?? new Map<string, string>());
    // HEAD が導入した変更を逆適用する
    const tree = cloneTree(headTree(repo));
    const changes = diffTrees(parentTree, commit.tree);
    for (const name of changes.added) tree.delete(name);
    for (const name of [...changes.modified, ...changes.deleted]) {
      const before = parentTree.get(name);
      if (before !== undefined) tree.set(name, before);
    }
    const reverted = createCommit(repo, `Revert "${commit.message}"`, tree, [head]);
    this.moveHead(reverted.hash);
    repo.workdir = cloneTree(tree);
    repo.index = cloneTree(tree);
    return ok(`[${this.currentBranchName() ?? "HEAD"} ${reverted.hash}] ${reverted.message}`);
  }

  private gitStash(args: string[]): Result {
    const repo = this.repo;
    if (args[0] === "pop") {
      const saved = repo.stash.pop();
      if (saved === undefined) return fail("退避した変更がありません");
      repo.workdir = saved.workdir;
      repo.index = saved.index;
      return ok("退避した変更を戻しました");
    }
    if (args.length > 0 && args[0] !== "push")
      return fail(`git stash: '${args[0]}' には対応していません(push / pop のみ)`);
    if (this.isCleanTree() && [...repo.workdir.keys()].every((n) => repo.index.has(n))) {
      return fail("退避する変更がありません");
    }
    repo.stash.push({ workdir: repo.workdir, index: repo.index });
    const tree = headTree(repo);
    repo.workdir = cloneTree(tree);
    repo.index = cloneTree(tree);
    return ok("変更を退避しました(stash)");
  }

  /** 追跡ファイル(index)視点で workdir / index / HEAD が一致しているか(未追跡ファイルは無視) */
  private isCleanTree(): boolean {
    const repo = this.repo;
    const staged = diffTrees(headTree(repo), repo.index);
    if (staged.added.length + staged.modified.length + staged.deleted.length > 0) return false;
    for (const [name, content] of repo.index) {
      if (repo.workdir.get(name) !== content) return false;
    }
    return true;
  }
}
