// git-sim のプレビュー用レンダラ(ターミナル風の再生表示 + 簡易ブランチグラフ)。
// vendor バンドル(app/public/vendor/git-sim.js)にのみ含める — git-sim/index.ts からは
// re-export しない(判定バンドルに DOM 生成コードを入れないため)。
// DOM 生成は必ず textContent ベース(ユーザー入力を innerHTML に入れない — §10.2)。

import { GitSim } from "./index";

const TERMINAL_STYLE = [
  "font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  "font-size: 12px",
  "line-height: 1.7",
  "background: #0f172a",
  "color: #e2e8f0",
  "padding: 16px",
  "min-height: 100%",
  "box-sizing: border-box",
  "white-space: pre-wrap",
  "word-break: break-all",
].join(";");

function block(text: string, color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.textContent = text;
  el.style.color = color;
  return el;
}

/**
 * setup スクリプト(出力なしの初期化)を流したうえでユーザースクリプトを実行し、
 * `$ コマンド` + 出力のターミナル風表示と `git log --graph` 相当の履歴グラフを
 * container に描画する。判定とは独立(プレビュー専用)。
 */
export function renderPlayback(container: Element, setupScript: string, userScript: string): GitSim {
  const sim = GitSim.fromScripts(setupScript, userScript);
  const root = document.createElement("div");
  root.setAttribute("style", TERMINAL_STYLE);

  const entries = sim.transcript();
  if (entries.length === 0) {
    root.appendChild(block("コマンドを書くと、ここに実行結果が表示されます", "#94a3b8"));
  }
  for (const entry of entries) {
    root.appendChild(block(`$ ${entry.command}`, "#7dd3fc"));
    if (entry.output !== "") {
      root.appendChild(block(entry.output, entry.error ? "#fda4af" : "#e2e8f0"));
    }
  }

  if (sim.commitCount("HEAD") > 0) {
    const divider = document.createElement("div");
    divider.textContent = "── 履歴(git log --graph)──";
    divider.style.cssText = "color:#64748b;margin-top:12px;";
    root.appendChild(divider);
    root.appendChild(block(sim.logGraph(), "#a5b4fc"));
  }

  container.textContent = "";
  container.appendChild(root);
  return sim;
}
