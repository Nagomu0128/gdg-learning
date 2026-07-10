// ファイルツリーペイン(CURRICULUM-2 プラットフォーム変更 1)。
// hidden 除外後のファイル数 >= 3 の演習で、md 以上ならタブの代わりに左サイドに表示する
// (VSCode / Progate 風)。editable:false は鍵アイコン付き読み取り専用表示(FileTabs と同じ規約)。
// キーボード: ↑↓ / Home / End で選択移動(選択追従)、Enter / Space は button ネイティブ。
import clsx from "clsx";
import { useRef } from "react";

export type FileTreeItemInfo = { name: string; editable: boolean };

/** 拡張子の色ドット(GDG カラー系。html=赤 / css=青 / js=黄 / その他=緑) */
function extColor(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "var(--gdg-red)";
  if (lower.endsWith(".css")) return "var(--gdg-blue)";
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "var(--gdg-yellow)";
  return "var(--gdg-green)";
}

export function FileTree(props: {
  files: FileTreeItemInfo[];
  active: string;
  onSelect: (name: string) => void;
}) {
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const names = props.files.map((f) => f.name);
    if (names.length === 0) return;
    const current = names.indexOf(props.active);
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = current < 0 ? 0 : (current + 1) % names.length;
        break;
      case "ArrowUp":
        next = current < 0 ? names.length - 1 : (current - 1 + names.length) % names.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = names.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const name = names[next];
    if (name === undefined) return;
    props.onSelect(name);
    itemRefs.current.get(name)?.focus();
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-100" data-testid="file-tree">
      <p className="px-3 pt-3 pb-1 font-semibold text-[11px] text-slate-500 tracking-wider">ファイル</p>
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="ファイル"
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-0.5 overflow-y-auto p-1.5"
      >
        {props.files.map((file) => {
          const selected = file.name === props.active;
          return (
            <button
              key={file.name}
              ref={(el) => {
                if (el) itemRefs.current.set(file.name, el);
                else itemRefs.current.delete(file.name);
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              data-testid={`file-tree-item-${file.name}`}
              onClick={() => props.onSelect(file.name)}
              className={clsx(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left font-mono text-[13px]",
                selected
                  ? "bg-white font-medium text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                  : "text-slate-600 hover:bg-slate-200",
              )}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: extColor(file.name) }}
              />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              {!file.editable && (
                <>
                  <span aria-hidden="true" className="shrink-0 text-xs">
                    🔒
                  </span>
                  <span className="sr-only">(読み取り専用)</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
