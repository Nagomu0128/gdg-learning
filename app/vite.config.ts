import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { mdxOptions } from "./mdx.config";

// dev 中に遅延発見されるクライアント依存(初回ページアクセスや動的 import で見つかる)。
// 途中での再最適化 → フルリロードは、①Windows で deps 差し替えの rename 競合により
// dev サーバプロセスごと落ちる、②リロードが実行中ページの動的 import を宙吊りにする
// (/dev/validate の検証ループが止まる)ため、起動時に事前最適化してレース自体を消す
// (L-runtime。E2E の安定化も兼ねる)
const LAZY_DEPS = [
  "@codemirror/commands",
  "@codemirror/lang-css",
  "@codemirror/lang-html",
  "@codemirror/lang-javascript",
  "@codemirror/language",
  "@codemirror/lint",
  "@codemirror/state",
  "@codemirror/view",
  "@mdx-js/react",
  // acorn は app 直下ではなく workspace リンクの lesson-kit 経由(`親 > 依存` 記法が必要)
  "@codesteps/lesson-kit > acorn",
  "@codesteps/lesson-kit > acorn-walk",
  "better-auth/react",
  "clsx",
  "sucrase",
];

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // mdx は reactRouter より前(SPEC 00)。オプションは mdx.config.ts(D 所有)から。
    mdx(mdxOptions),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  optimizeDeps: { include: LAZY_DEPS },
  ssr: { optimizeDeps: { include: LAZY_DEPS } },
});
