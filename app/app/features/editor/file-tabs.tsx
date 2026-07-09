// ファイルタブ(DesignDoc §2.3)。editable:false は鍵アイコン付き読み取り専用表示。
import clsx from "clsx";

export type FileTabInfo = { name: string; editable: boolean };

export function FileTabs(props: { files: FileTabInfo[]; active: string; onSelect: (name: string) => void }) {
  return (
    <div
      role="tablist"
      aria-label="ファイル"
      className="flex items-end gap-1 overflow-x-auto border-slate-200 border-b bg-slate-100 px-2 pt-2"
    >
      {props.files.map((file) => {
        const selected = file.name === props.active;
        return (
          <button
            key={file.name}
            type="button"
            role="tab"
            aria-selected={selected}
            data-testid={`file-tab-${file.name}`}
            onClick={() => props.onSelect(file.name)}
            className={clsx(
              "flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3 py-1.5 font-mono text-sm",
              selected
                ? "border border-slate-200 border-b-white bg-white font-medium text-slate-900"
                : "text-slate-500 hover:bg-slate-200",
            )}
          >
            {!file.editable && (
              <>
                <span aria-hidden="true">🔒</span>
                <span className="sr-only">(読み取り専用)</span>
              </>
            )}
            <span>{file.name}</span>
          </button>
        );
      })}
    </div>
  );
}
