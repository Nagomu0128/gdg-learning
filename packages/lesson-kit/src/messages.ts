// 既定メッセージ生成(DesignDoc §5.2)。文言の一元管理 = トーン統一の SSOT。
// トーン: 日本語・初学者向け・「〜しましょう」調。責めない。

import type { Check } from "./types";

function describeSelector(selector: string): string {
  if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(selector)) return `<${selector}>タグ`;
  return `「${selector}」に当てはまる要素`;
}

export function defaultMessageFor(check: Check): string {
  switch (check.type) {
    case "element": {
      const target = describeSelector(check.selector);
      if (check.count !== undefined) {
        return `${target}を${check.count}個にしましょう`;
      }
      return `${target}が見つかりません`;
    }
    case "text": {
      const target = describeSelector(check.selector);
      if (check.equals !== undefined) {
        return `${target}の中身を「${check.equals}」にしましょう`;
      }
      if (check.contains !== undefined) {
        return `${target}に「${check.contains}」という文字を入れましょう`;
      }
      return `${target}の中身を見直してみましょう`;
    }
    case "attribute": {
      const target = describeSelector(check.selector);
      if (check.equals !== undefined) {
        return `${target}の${check.name}属性を「${check.equals}」にしましょう`;
      }
      return `${target}に${check.name}属性を付けましょう`;
    }
    case "style":
      return `${check.selector} の ${check.property} が ${check.equals} になっていません`;
    case "source":
      return "コードに必要な記述が見つかりません。スライドを見直してみましょう";
    case "console": {
      const first = check.lines[0] ?? "";
      if (check.lines.length === 1) {
        return `「${first}」がコンソールに出力されていません`;
      }
      return `「${first}」など${check.lines.length}行の出力がコンソールにそろっていません`;
    }
    case "fn": {
      const argList = check.args.map((a) => JSON.stringify(a)).join(", ");
      return `${check.name}(${argList}) の戻り値が ${JSON.stringify(check.returns)} ではありません`;
    }
    case "custom":
      return check.message;
  }
}
