// MDX オプションの分離点(D 所有)。vite.config.ts から import される。
// - providerImportSource: MDXProvider(@mdx-js/react)経由でコンポーネントを解決する
//   (スライドの h1/p/code 等のスタイルと <Callout> は ~/features/slides/mdx-components.tsx が提供)
// - コードブロックは @shikijs/rehype でビルド時にハイライトし、クライアントに Shiki を載せない(§4.3)
import type { Options } from "@mdx-js/rollup";
import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";

const shikiOptions: RehypeShikiOptions = {
  theme: "github-light",
};

export const mdxOptions: Options = {
  providerImportSource: "@mdx-js/react",
  rehypePlugins: [[rehypeShiki, shikiOptions]],
};
