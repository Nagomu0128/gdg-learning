// 全角 lint の CodeMirror 6 拡張(SPEC E §2)。
// ①全角スペースの常時背景ハイライト ②全角記号の警告波線(linter)。純粋ロジックは zenkaku-lint.ts。
import { type Diagnostic, linter } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { zenkakuDiagnostics, zenkakuSpaceRanges } from "./zenkaku-lint";

const zenkakuSpaceMark = Decoration.mark({ class: "cm-zenkakuSpace" });

function buildSpaceDecorations(view: EditorView): DecorationSet {
  const ranges = zenkakuSpaceRanges(view.state.doc.toString());
  return Decoration.set(ranges.map((range) => zenkakuSpaceMark.range(range.from, range.to)));
}

const zenkakuSpaceHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildSpaceDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) this.decorations = buildSpaceDecorations(update.view);
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

const zenkakuTheme = EditorView.baseTheme({
  ".cm-zenkakuSpace": {
    backgroundColor: "rgba(244, 63, 94, 0.2)",
    outline: "1px solid rgba(244, 63, 94, 0.45)",
    borderRadius: "2px",
  },
});

const zenkakuLinter = linter((view): Diagnostic[] => zenkakuDiagnostics(view.state.doc.toString()), {
  delay: 300,
});

/** 全角スペース可視化 + 全角記号警告をまとめた拡張 */
export function zenkakuExtension(): Extension {
  return [zenkakuSpaceHighlighter, zenkakuTheme, zenkakuLinter];
}
