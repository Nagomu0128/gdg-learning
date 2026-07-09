// CodeMirror 6 ラッパー(DesignDoc §2.3 / SPEC E §2)。
// client-only: EditorView は useEffect 内でのみ生成する(SSR には載らない)。
// 自動補完は入れない(ADR #11)。行の折返しなし・タブ幅 2・行番号あり。
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, defaultHighlightStyle, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { EditorState, type Extension, Prec } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { zenkakuExtension } from "./zenkaku-extension";

function languageFor(fileName: string): Extension {
  if (fileName.endsWith(".html") || fileName.endsWith(".htm")) return html();
  if (fileName.endsWith(".css")) return css();
  if (fileName.endsWith(".js") || fileName.endsWith(".mjs")) return javascript();
  return [];
}

const editorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "14px", backgroundColor: "#ffffff" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": { backgroundColor: "#f8fafc", color: "#94a3b8", border: "none" },
});

export function CodeEditor(props: {
  fileName: string;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  /** Ctrl/Cmd+Enter(§2.3 の明示実行)。未指定なら既定のキー動作に任せる */
  onRun?: () => void;
}) {
  const { fileName, value, readOnly } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  // コールバック・最新値は ref 経由で参照し、EditorView の再生成を fileName/readOnly 変更時に限定する
  const onChangeRef = useRef(props.onChange);
  onChangeRef.current = props.onChange;
  const onRunRef = useRef(props.onRun);
  onRunRef.current = props.onRun;
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const parent = containerRef.current;
    if (parent === null) return;
    const state = EditorState.create({
      doc: valueRef.current,
      extensions: [
        lineNumbers(),
        history(),
        highlightActiveLine(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle),
        indentUnit.of("  "),
        EditorState.tabSize.of(2),
        languageFor(fileName),
        zenkakuExtension(),
        Prec.highest(
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => {
                const onRun = onRunRef.current;
                if (onRun === undefined) return false;
                onRun();
                return true;
              },
            },
          ]),
        ),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
        EditorView.contentAttributes.of({ "aria-label": `コードエディタ: ${fileName}` }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
        editorTheme,
      ],
    });
    const view = new EditorView({ state, parent });
    viewRef.current = view;
    return () => {
      viewRef.current = null;
      view.destroy();
    };
  }, [fileName, readOnly]);

  // 外部からの value 変更(リセット・タブ復帰)をエディタへ反映する
  useEffect(() => {
    const view = viewRef.current;
    if (view === null) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} data-testid="editor" className="h-full min-h-0" />;
}
