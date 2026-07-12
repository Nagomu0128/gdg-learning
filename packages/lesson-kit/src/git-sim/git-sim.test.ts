import { describe, expect, it } from "vitest";
import { tokenize } from "./engine";
import { GitSim } from "./index";

/** setup なしでユーザースクリプトだけ実行するヘルパ */
function run(script: string): GitSim {
  return GitSim.fromScripts("", script);
}

describe("tokenize", () => {
  it("クォートとリダイレクトを解釈する", () => {
    expect(tokenize('echo "hello world" > file.txt')).toEqual(["echo", "hello world", ">", "file.txt"]);
    expect(tokenize("echo abc >> log.txt")).toEqual(["echo", "abc", ">>", "log.txt"]);
    expect(tokenize("echo hi>file")).toEqual(["echo", "hi", ">", "file"]);
    expect(tokenize('git commit -m "最初のコミット"')).toEqual(["git", "commit", "-m", "最初のコミット"]);
    expect(tokenize("git  add   .")).toEqual(["git", "add", "."]);
  });
});

describe("シェルコマンド", () => {
  it("echo のリダイレクトと追記、cat、ls、touch", () => {
    const sim = run(`
echo "1行目" > a.txt
echo "2行目" >> a.txt
touch b.txt
cat a.txt
ls
`);
    expect(sim.fileContent("a.txt")).toBe("1行目\n2行目\n");
    expect(sim.fileContent("b.txt")).toBe("");
    const outputs = sim.transcript().map((e) => e.output);
    expect(outputs).toContain("1行目\n2行目");
    expect(outputs).toContain("a.txt  b.txt");
    expect(sim.hasErrors()).toBe(false);
  });

  it("リダイレクトなしの echo は出力に出る", () => {
    const sim = run("echo こんにちは");
    expect(sim.lastOutput()).toBe("こんにちは");
  });

  it("cat の対象がなければエラーとして続行する", () => {
    const sim = run("cat nai.txt\necho ok");
    expect(sim.hasErrors()).toBe(true);
    expect(sim.lastOutput()).toBe("ok");
  });
});

describe("init / add / commit / status / log", () => {
  it("init → echo → add → commit の基本フロー", () => {
    const sim = run(`
git init
echo "# メモ" > README.md
git add README.md
git commit -m "最初のコミット"
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.currentBranch()).toBe("main");
    expect(sim.branches()).toEqual(["main"]);
    expect(sim.commitCount("HEAD")).toBe(1);
    expect(sim.log()).toEqual(["最初のコミット"]);
    expect(sim.isClean()).toBe(true);
  });

  it("init 前の git コマンドはエラー", () => {
    const sim = run("git status");
    expect(sim.hasErrors()).toBe(true);
    expect(sim.lastOutput()).toContain("git init");
  });

  it("add していないファイルは commit されない(エラー)", () => {
    const sim = run(`
git init
echo a > a.txt
git commit -m "empty"
`);
    expect(sim.hasErrors()).toBe(true);
    expect(sim.commitCount("HEAD")).toBe(0);
    expect(sim.lastOutput()).toContain("git add");
  });

  it("add . で全ファイルをステージし、stagedFiles が差分を返す", () => {
    const sim = run(`
git init
echo a > a.txt
echo b > b.txt
git add .
`);
    expect(sim.stagedFiles()).toEqual(["a.txt", "b.txt"]);
    expect(sim.isClean()).toBe(false);
  });

  it("存在しないファイルの add はエラー", () => {
    const sim = run("git init\ngit add nai.txt");
    expect(sim.hasErrors()).toBe(true);
    expect(sim.lastOutput()).toContain("pathspec");
  });

  it("status が段階ごとの状態を表示する", () => {
    const sim = run(`
git init
echo a > a.txt
git status
`);
    expect(sim.lastOutput()).toContain("未追跡のファイル");
    expect(sim.lastOutput()).toContain("a.txt");
  });

  it("log --oneline と log --graph が動く", () => {
    const sim = run(`
git init
echo a > a.txt
git add .
git commit -m "one"
git log --oneline
git log --graph
`);
    const outputs = sim.transcript().map((e) => e.output);
    expect(outputs.some((o) => /^[0-9a-f]{7} .*one/m.test(o))).toBe(true);
    expect(outputs.some((o) => o.includes("* ") && o.includes("one"))).toBe(true);
  });
});

describe("branch / switch / checkout", () => {
  const base = `
git init
echo a > a.txt
git add .
git commit -m "base"
`;

  it("branch 作成・一覧・switch -c / checkout -b", () => {
    const sim = run(`${base}
git branch feature
git switch feature
git switch -c topic
git checkout main
git checkout -b hotfix
git branch
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.branches()).toEqual(["feature", "hotfix", "main", "topic"]);
    expect(sim.currentBranch()).toBe("hotfix");
    expect(sim.lastOutput()).toContain("* hotfix");
  });

  it("存在しないブランチへの switch はエラー", () => {
    const sim = run(`${base}\ngit switch nai`);
    expect(sim.hasErrors()).toBe(true);
  });

  it("未コミットの変更があると switch できない", () => {
    const sim = run(`${base}
git branch feature
echo changed > a.txt
git switch feature
`);
    expect(sim.hasErrors()).toBe(true);
    expect(sim.lastOutput()).toContain("stash");
  });

  it("未追跡ファイルは switch で持ち越せる", () => {
    const sim = run(`${base}
git branch feature
echo memo > memo.txt
git switch feature
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.fileContent("memo.txt")).toBe("memo\n");
  });

  it("マージ済みブランチは -d で削除できるが、今いるブランチは削除できない", () => {
    const sim = run(`${base}
git branch feature
git branch -d feature
git branch -d main
`);
    const entries = sim.transcript();
    expect(entries[entries.length - 2]?.error).toBe(false);
    expect(entries[entries.length - 1]?.error).toBe(true);
    expect(sim.branchExists("feature")).toBe(false);
  });

  it("未マージのブランチは -d で削除できない", () => {
    const sim = run(`${base}
git switch -c feature
echo f > f.txt
git add .
git commit -m "f"
git switch main
git branch -d feature
`);
    expect(sim.hasErrors()).toBe(true);
    expect(sim.branchExists("feature")).toBe(true);
  });
});

describe("merge", () => {
  const forked = `
git init
echo base > common.txt
git add .
git commit -m "base"
git switch -c feature
echo feat > feature.txt
git add .
git commit -m "feat"
git switch main
`;

  it("fast-forward マージ", () => {
    const sim = run(`${forked}\ngit merge feature`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.lastOutput()).toContain("Fast-forward");
    expect(sim.log()).toEqual(["feat", "base"]);
    expect(sim.isMerged("feature", "main")).toBe(true);
    expect(sim.isLinearHistory("main")).toBe(true);
  });

  it("3-way マージでマージコミットができる", () => {
    const sim = run(`${forked}
echo main > main.txt
git add .
git commit -m "main側"
git merge feature
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.commitCount("main")).toBe(3); // base → main側 → merge(第1親チェーン)
    expect(sim.log()[0]).toContain("Merge branch 'feature'");
    expect(sim.fileContent("feature.txt")).toBe("feat\n");
    expect(sim.fileContent("main.txt")).toBe("main\n");
    expect(sim.isMerged("feature", "main")).toBe(true);
    expect(sim.isLinearHistory("main")).toBe(false);
  });

  it("同一ファイルの両側変更はコンフリクトになり、解決 → add → commit で完了する", () => {
    const conflictSetup = `
git init
echo はじめ > greeting.txt
git add .
git commit -m "base"
git switch -c feature
echo こんばんは > greeting.txt
git add .
git commit -m "feature側"
git switch main
echo こんにちは > greeting.txt
git add .
git commit -m "main側"
`;
    const sim1 = run(`${conflictSetup}\ngit merge feature`);
    expect(sim1.hasErrors()).toBe(true);
    expect(sim1.isMerging()).toBe(true);
    expect(sim1.hasConflictMarkers("greeting.txt")).toBe(true);
    const content = sim1.fileContent("greeting.txt") ?? "";
    expect(content).toContain("<<<<<<< HEAD");
    expect(content).toContain("=======");
    expect(content).toContain(">>>>>>> feature");

    const sim2 = run(`${conflictSetup}
git merge feature
echo "こんにちは と こんばんは" > greeting.txt
git add greeting.txt
git commit -m "コンフリクト解消"
`);
    expect(sim2.isMerging()).toBe(false);
    expect(sim2.isClean()).toBe(true);
    expect(sim2.log()[0]).toBe("コンフリクト解消");
    expect(sim2.hasConflictMarkers("greeting.txt")).toBe(false);
    expect(sim2.isMerged("feature", "main")).toBe(true);

    // 解決前の commit はエラー
    const sim3 = run(`${conflictSetup}\ngit merge feature\ngit commit -m "早すぎ"`);
    expect(sim3.lastOutput()).toContain("未解決");
  });

  it("merge --abort で元の状態に戻る", () => {
    const sim = run(`
git init
echo v1 > f.txt
git add .
git commit -m "base"
git switch -c other
echo v2 > f.txt
git add .
git commit -m "other"
git switch main
echo v3 > f.txt
git add .
git commit -m "main"
git merge other
git merge --abort
`);
    expect(sim.isMerging()).toBe(false);
    expect(sim.fileContent("f.txt")).toBe("v3\n");
    expect(sim.log()).toEqual(["main", "base"]);
    expect(sim.isClean()).toBe(true);
  });

  it("取り込み済みなら Already up to date", () => {
    const sim = run(`${forked}\ngit merge feature\ngit merge feature`);
    expect(sim.lastOutput()).toContain("既に最新");
  });
});

describe("rebase", () => {
  const diverged = `
git init
echo base > base.txt
git add .
git commit -m "base"
git switch -c feature
echo f1 > f1.txt
git add .
git commit -m "f1"
echo f2 > f2.txt
git add .
git commit -m "f2"
git switch main
echo m1 > m1.txt
git add .
git commit -m "m1"
git switch feature
`;

  it("通常の rebase で履歴が線形になる", () => {
    const sim = run(`${diverged}\ngit rebase main`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.currentBranch()).toBe("feature");
    expect(sim.log()).toEqual(["f2", "f1", "m1", "base"]);
    expect(sim.isLinearHistory("feature")).toBe(true);
    expect(sim.isMerged("main", "feature")).toBe(true);
    expect(sim.fileContent("m1.txt")).toBe("m1\n");
    expect(sim.fileContent("f2.txt")).toBe("f2\n");
  });

  it("conflict → 解決 → git add → git rebase --continue で完走する", () => {
    const conflicting = `
git init
echo v0 > shared.txt
git add .
git commit -m "base"
git switch -c feature
echo feature版 > shared.txt
git add .
git commit -m "feature変更"
git switch main
echo main版 > shared.txt
git add .
git commit -m "main変更"
git switch feature
`;
    const sim1 = run(`${conflicting}\ngit rebase main`);
    expect(sim1.isRebasing()).toBe(true);
    expect(sim1.hasConflictMarkers("shared.txt")).toBe(true);
    expect(sim1.lastOutput()).toContain("--continue");

    const sim2 = run(`${conflicting}
git rebase main
echo 解決版 > shared.txt
git add shared.txt
git rebase --continue
`);
    expect(sim2.isRebasing()).toBe(false);
    expect(sim2.hasErrors()).toBe(true); // conflict の行だけがエラー(その後は成功)
    expect(sim2.lastOutput()).toContain("rebase 完了");
    expect(sim2.log()).toEqual(["feature変更", "main変更", "base"]);
    expect(sim2.fileContent("shared.txt")).toBe("解決版\n");
    expect(sim2.isLinearHistory("feature")).toBe(true);

    // 解決せず --continue はエラー
    const sim3 = run(`${conflicting}\ngit rebase main\ngit rebase --continue`);
    expect(sim3.lastOutput()).toContain("未解決");
    expect(sim3.isRebasing()).toBe(true);
  });

  it("rebase --abort で元に戻る", () => {
    const sim = run(`
git init
echo v0 > shared.txt
git add .
git commit -m "base"
git switch -c feature
echo feature版 > shared.txt
git add .
git commit -m "feature変更"
git switch main
echo main版 > shared.txt
git add .
git commit -m "main変更"
git switch feature
git rebase main
git rebase --abort
`);
    expect(sim.isRebasing()).toBe(false);
    expect(sim.currentBranch()).toBe("feature");
    expect(sim.log()).toEqual(["feature変更", "base"]);
    expect(sim.fileContent("shared.txt")).toBe("feature版\n");
  });
});

describe("push / fetch / pull", () => {
  const local = `
git init
echo a > a.txt
git add .
git commit -m "first"
`;

  it("push -u origin main でリモートにブランチができ、以後 push だけでよい", () => {
    const sim = run(`${local}
git push -u origin main
echo b > b.txt
git add .
git commit -m "second"
git push
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.remoteBranchExists("origin/main")).toBe(true);
    expect(sim.remoteLog("origin/main")).toEqual(["second", "first"]);
  });

  it("上流未設定の push はエラー", () => {
    const sim = run(`${local}\ngit push`);
    expect(sim.hasErrors()).toBe(true);
    expect(sim.lastOutput()).toContain("-u");
  });

  it("リモートが先に進んでいる push は拒否される", () => {
    // push 後に reset --hard で自分だけ巻き戻す → リモートが先行した状態を再現
    const sim = run(`${local}
echo b > b.txt
git add .
git commit -m "second"
git push -u origin main
git reset --hard HEAD~1
echo c > c.txt
git add .
git commit -m "third"
git push
`);
    expect(sim.lastOutput()).toContain("git pull");
    expect(sim.remoteLog("origin/main")).toEqual(["second", "first"]);
  });

  it("pull でリモートの先行分を fast-forward で取り込める", () => {
    const sim = run(`${local}
echo b > b.txt
git add .
git commit -m "second"
git push -u origin main
git reset --hard HEAD~1
git pull
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.log()).toEqual(["second", "first"]);
    expect(sim.lastOutput()).toContain("Fast-forward");
  });

  it("ローカルとリモートが分岐した pull はマージ(コンフリクトもあり得る)", () => {
    const sim = run(`${local}
echo リモート版 > a.txt
git add .
git commit -m "remote-change"
git push -u origin main
git reset --hard HEAD~1
echo ローカル版 > a.txt
git add .
git commit -m "local-change"
git pull
`);
    expect(sim.isMerging()).toBe(true);
    expect(sim.hasConflictMarkers("a.txt")).toBe(true);
    expect(sim.fileContent("a.txt")).toContain(">>>>>>> origin/main");
  });

  it("fetch はリモート追跡参照を更新するだけ", () => {
    const sim = run(`${local}
git push -u origin main
git fetch
`);
    expect(sim.lastOutput()).toContain("既に最新");
  });
});

describe("reset / revert / stash / diff", () => {
  const two = `
git init
echo v1 > f.txt
git add .
git commit -m "one"
echo v2 > f.txt
git add .
git commit -m "two"
`;

  it("reset --hard HEAD~1 でコミットと作業ツリーが巻き戻る", () => {
    const sim = run(`${two}\ngit reset --hard HEAD~1`);
    expect(sim.log()).toEqual(["one"]);
    expect(sim.fileContent("f.txt")).toBe("v1\n");
    expect(sim.isClean()).toBe(true);
  });

  it("reset --soft HEAD~1 はコミットだけ巻き戻り、変更がステージに残る", () => {
    const sim = run(`${two}\ngit reset --soft HEAD~1`);
    expect(sim.log()).toEqual(["one"]);
    expect(sim.fileContent("f.txt")).toBe("v2\n");
    expect(sim.stagedFiles()).toEqual(["f.txt"]);
  });

  it("revert HEAD で打ち消しコミットができる", () => {
    const sim = run(`${two}\ngit revert HEAD`);
    expect(sim.log()).toEqual(['Revert "two"', "two", "one"]);
    expect(sim.fileContent("f.txt")).toBe("v1\n");
    expect(sim.isClean()).toBe(true);
  });

  it("stash → switch → stash pop の流れ", () => {
    const sim = run(`${two}
git branch other
echo 作業中 > f.txt
git stash
git switch other
git switch main
git stash pop
`);
    expect(sim.hasErrors()).toBe(false);
    expect(sim.fileContent("f.txt")).toBe("作業中\n");
    const outputs = sim.transcript().map((e) => e.output);
    expect(outputs).toContain("変更を退避しました(stash)");
  });

  it("diff / diff --staged が変更行を表示する", () => {
    const sim = run(`${two}
echo v3 > f.txt
git diff
git add .
git diff --staged
`);
    const outputs = sim.transcript().map((e) => e.output);
    expect(outputs.some((o) => o.includes("- v2") && o.includes("+ v3"))).toBe(true);
    expect(outputs[outputs.length - 1]).toContain("+ v3");
  });
});

describe("setup スクリプトと transcript の分離", () => {
  it("setup の出力は transcript に含まれず、状態だけ引き継ぐ", () => {
    const setup = `
git init
echo リモート済み > shared.txt
git add .
git commit -m "seeded"
git push -u origin main
`;
    const sim = GitSim.fromScripts(setup, "git status");
    expect(sim.transcript()).toHaveLength(1);
    expect(sim.commitCount("HEAD")).toBe(1);
    expect(sim.remoteBranchExists("origin/main")).toBe(true);
  });
});

describe("エラー耐性と決定性", () => {
  it("未知コマンドはエラーを記録して続行する", () => {
    const sim = run(`
sudo rm -rf /
git init
git 存在しないサブコマンド
echo ok
`);
    expect(sim.transcript()[0]?.error).toBe(true);
    expect(sim.transcript()[0]?.output).toContain("コマンドが見つかりません");
    expect(sim.transcript()[2]?.error).toBe(true);
    expect(sim.lastOutput()).toBe("ok");
  });

  it("同一入力なら何度実行してもハッシュと出力が完全一致する(決定性)", () => {
    const script = `
git init
echo a > a.txt
git add .
git commit -m "one"
git switch -c feature
echo b > b.txt
git add .
git commit -m "two"
git switch main
git merge feature
git log --oneline
`;
    const a = run(script);
    const b = run(script);
    expect(a.headHash()).not.toBeNull();
    expect(a.headHash()).toBe(b.headHash());
    expect(a.transcript()).toEqual(b.transcript());
    expect(a.logGraph()).toBe(b.logGraph());
  });

  it("ハッシュは 7 桁 hex", () => {
    const sim = run("git init\necho a > a.txt\ngit add .\ngit commit -m x");
    expect(sim.headHash()).toMatch(/^[0-9a-f]{7}$/);
  });
});
