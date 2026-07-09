import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { mdxOptions } from "./mdx.config";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // mdx は reactRouter より前(SPEC 00)。オプションは mdx.config.ts(D 所有)から。
    mdx(mdxOptions),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
