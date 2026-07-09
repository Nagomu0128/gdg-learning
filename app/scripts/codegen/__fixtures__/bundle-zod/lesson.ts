import { z } from "zod";

// 判定バンドルに zod が混入する NG パターン(judge-bundle.test.ts が拒否を検証する)
export default {
  slug: "demo-zod",
  title: z.string().parse("zod を巻き込む教材"),
  files: { "script.js": { initial: "" } },
  checks: [{ type: "console", id: "hello", lines: ["hello"] }],
  hints: ["ヒント"],
  solution: { "script.js": 'console.log("hello");\n' },
};
