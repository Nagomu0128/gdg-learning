// スライド用 MDX コンポーネント(D 所有。SPEC D §3)。
// mdx.config.ts の providerImportSource: "@mdx-js/react" により、MDXProvider の components が
// markdown 由来の要素(rehype-shiki の出力を含む)と <Callout> に適用される。
import { clsx } from "clsx";
import type { MDXComponents } from "mdx/types";
import { type ComponentProps, createContext, type ReactNode, useContext } from "react";

type CalloutType = "info" | "warn";

/** 教材 MDX で使える唯一の独自コンポーネント(CURRICULUM 共通ルール)。 */
export function Callout({ type = "info", children }: { type?: CalloutType; children: ReactNode }) {
  const isWarn = type === "warn";
  return (
    <aside
      className={clsx(
        "my-5 flex gap-2 rounded-xl border px-4 py-3 text-base leading-relaxed [&_p]:my-0",
        isWarn
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-indigo-200 bg-indigo-50 text-indigo-900",
      )}
    >
      <span className="shrink-0 font-bold">{isWarn ? "注意:" : "ポイント:"}</span>
      <div className="min-w-0">{children}</div>
    </aside>
  );
}

// pre(コードブロック)内の code にはインラインコード用の装飾を当てない
const PreContext = createContext(false);

function Pre({ className, ...rest }: ComponentProps<"pre">) {
  // Shiki の出力(className "shiki" + インライン style の背景色)はそのまま活かす
  return (
    <PreContext.Provider value={true}>
      <pre
        {...rest}
        className={clsx(
          className,
          "my-5 overflow-x-auto rounded-xl border border-slate-200 p-4 text-sm leading-relaxed",
        )}
      />
    </PreContext.Provider>
  );
}

function Code({ className, ...rest }: ComponentProps<"code">) {
  const inPre = useContext(PreContext);
  if (inPre) {
    return <code className={className} {...rest} />;
  }
  return (
    <code
      {...rest}
      className={clsx(className, "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800")}
    />
  );
}

// スライド文脈: 大きめフォント・広い行間(SPEC D §3)
export const slideMdxComponents: MDXComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 {...props} className="mt-2 mb-6 font-bold text-3xl text-slate-900 leading-snug" />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 {...props} className="mt-8 mb-3 font-bold text-2xl text-slate-900 leading-snug" />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 {...props} className="mt-6 mb-2 font-bold text-slate-900 text-xl leading-snug" />
  ),
  p: (props: ComponentProps<"p">) => <p {...props} className="my-4 text-lg text-slate-800 leading-8" />,
  ul: (props: ComponentProps<"ul">) => (
    <ul {...props} className="my-4 list-disc space-y-2 pl-7 text-lg text-slate-800 leading-8" />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol {...props} className="my-4 list-decimal space-y-2 pl-7 text-lg text-slate-800 leading-8" />
  ),
  li: (props: ComponentProps<"li">) => <li {...props} className="marker:text-slate-400" />,
  a: (props: ComponentProps<"a">) => (
    <a {...props} className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800" />
  ),
  strong: (props: ComponentProps<"strong">) => <strong {...props} className="font-bold text-slate-900" />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote {...props} className="my-4 border-slate-300 border-l-4 pl-4 text-slate-600" />
  ),
  hr: (props: ComponentProps<"hr">) => <hr {...props} className="my-8 border-slate-200" />,
  table: (props: ComponentProps<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-base" />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th {...props} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-bold" />
  ),
  td: (props: ComponentProps<"td">) => <td {...props} className="border border-slate-200 px-3 py-2" />,
  pre: Pre,
  code: Code,
  Callout,
};
