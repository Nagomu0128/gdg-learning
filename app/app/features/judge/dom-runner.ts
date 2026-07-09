// 判定 iframe(クリーンルーム — §6.3)。毎回新規生成し、verdict 受信 or タイムアウトで必ず破棄する。

import type { Verdict } from "@codesteps/lesson-kit";
import { JUDGE_TIMEOUT_MS, TIMEOUT_MESSAGE_JP } from "@codesteps/lesson-kit";
import { isVerdict, messageRecord } from "./guards";
import { JUDGE_RESULT_KIND } from "./protocol";

export function runDomJudge(html: string, nonce: string): Promise<Verdict> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    // allow-same-origin は絶対に付与しない(§6.2 [最小権限])
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.setAttribute("aria-hidden", "true");
    iframe.width = "800";
    iframe.height = "600";
    iframe.style.cssText = "position:absolute;left:-9999px;top:0;width:800px;height:600px;border:0;";

    let settled = false;
    const finish = (verdict: Verdict): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      resolve(verdict);
    };

    // 受理は 3 条件すべて: source 一致 / origin "null" / nonce 一致(§5.5 [多層防御])
    const onMessage = (e: MessageEvent): void => {
      if (e.source !== iframe.contentWindow) return;
      if (e.origin !== "null") return;
      const data = messageRecord(e.data);
      if (data === null || data.kind !== JUDGE_RESULT_KIND || data.nonce !== nonce) return;
      if (!isVerdict(data.verdict)) return;
      finish(data.verdict);
    };

    // タイムアウトを最外殻に置く(§5.5 [フェイルセーフ])
    const timer = window.setTimeout(() => {
      finish({
        passed: false,
        display: { checkId: "__timeout__", message: TIMEOUT_MESSAGE_JP },
        details: [],
        console: [],
        timedOut: true,
      });
    }, JUDGE_TIMEOUT_MS);

    window.addEventListener("message", onMessage);
    document.body.appendChild(iframe);
    iframe.srcdoc = html;
  });
}
