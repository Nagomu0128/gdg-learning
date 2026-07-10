// ビルド時 / テスト時専用(zod は判定バンドルに入れない — package の sideEffects:false + ここ以外で import 禁止)
import { z } from "zod";

export const SHORTHAND_BLOCKLIST: ReadonlySet<string> = new Set([
  "margin",
  "padding",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-width",
  "border-style",
  "border-color",
  "border-radius",
  "background",
  "font",
  "flex",
  "flex-flow",
  "gap",
  "inset",
  "outline",
  "overflow",
  "place-items",
  "place-content",
  "text-decoration",
  "list-style",
  "transition",
  "animation",
  "columns",
  "grid",
  "grid-area",
  "grid-column",
  "grid-row",
]);

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const idSchema = z.string().regex(slugPattern);

function validRegex(pattern: string, flags?: string): boolean {
  try {
    new RegExp(pattern, flags);
    return true;
  } catch {
    return false;
  }
}

const checkBase = { id: idSchema, message: z.string().min(1).optional() };

const elementCheckSchema = z.object({
  ...checkBase,
  type: z.literal("element"),
  selector: z.string().min(1),
  count: z.number().int().min(0).optional(),
});

const textCheckSchema = z
  .object({
    ...checkBase,
    type: z.literal("text"),
    selector: z.string().min(1),
    equals: z.string().optional(),
    contains: z.string().optional(),
    pattern: z.string().optional(),
    flags: z.string().optional(),
    exact: z.boolean().optional(),
    ignoreCase: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.equals === undefined && v.contains === undefined && v.pattern === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "text check には equals / contains / pattern のいずれかが必要です",
      });
    }
    if (v.pattern !== undefined && !validRegex(v.pattern, v.flags)) {
      ctx.addIssue({ code: "custom", message: `不正な正規表現です: ${v.pattern}` });
    }
  });

const attributeCheckSchema = z
  .object({
    ...checkBase,
    type: z.literal("attribute"),
    selector: z.string().min(1),
    name: z.string().min(1),
    equals: z.string().optional(),
    exists: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.equals === undefined && v.exists === undefined) {
      ctx.addIssue({ code: "custom", message: "attribute check には equals か exists が必要です" });
    }
  });

const styleCheckSchema = z
  .object({
    ...checkBase,
    type: z.literal("style"),
    selector: z.string().min(1),
    property: z.string().regex(/^[a-z]+(-[a-z]+)*$/),
    equals: z.string().min(1),
  })
  .superRefine((v, ctx) => {
    if (SHORTHAND_BLOCKLIST.has(v.property)) {
      ctx.addIssue({
        code: "custom",
        message: `style check の property は longhand 限定です(§5.3): ${v.property} は shorthand`,
      });
    }
  });

const sourceCheckSchema = z
  .object({
    ...checkBase,
    type: z.literal("source"),
    file: z.string().min(1),
    pattern: z.string().min(1),
    flags: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (!validRegex(v.pattern, v.flags)) {
      ctx.addIssue({ code: "custom", message: `不正な正規表現です: ${v.pattern}` });
    }
  });

const consoleCheckSchema = z.object({
  ...checkBase,
  type: z.literal("console"),
  lines: z.array(z.string().min(1)).min(1),
  ordered: z.boolean().optional(),
});

const fnCheckSchema = z.object({
  ...checkBase,
  type: z.literal("fn"),
  name: z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/),
  args: z.array(z.unknown()),
  returns: z.unknown(),
});

const customCheckSchema = z.object({
  id: idSchema,
  message: z.string().min(1),
  type: z.literal("custom"),
  run: z.custom<(ctx: unknown) => boolean | Promise<boolean>>((v) => typeof v === "function", {
    message: "custom check の run は関数である必要があります",
  }),
});

export const checkSchema = z.discriminatedUnion("type", [
  elementCheckSchema,
  textCheckSchema,
  attributeCheckSchema,
  styleCheckSchema,
  sourceCheckSchema,
  consoleCheckSchema,
  fnCheckSchema,
  customCheckSchema,
]);

const lessonFileSchema = z.object({
  initial: z.string(),
  editable: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

export const lessonSchema = z
  .object({
    slug: z.string().regex(slugPattern),
    title: z.string().min(1),
    estMinutes: z.number().int().positive().optional(),
    runner: z.enum(["dom", "worker"]).optional(),
    files: z.record(z.string().min(1), lessonFileSchema),
    checks: z.array(checkSchema).min(1),
    hints: z.array(z.string().min(1)).min(1),
    solution: z.record(z.string().min(1), z.string()),
  })
  .superRefine((lesson, ctx) => {
    if (Object.keys(lesson.files).length === 0) {
      ctx.addIssue({ code: "custom", message: "files は 1 ファイル以上必要です" });
    }
    const ids = new Set<string>();
    for (const check of lesson.checks) {
      if (ids.has(check.id)) {
        ctx.addIssue({ code: "custom", message: `check id が重複しています: ${check.id}` });
      }
      ids.add(check.id);
      if (check.type === "source" && !(check.file in lesson.files)) {
        ctx.addIssue({
          code: "custom",
          message: `source check の file が files にありません: ${check.file}`,
        });
      }
    }
    for (const key of Object.keys(lesson.solution)) {
      if (!(key in lesson.files)) {
        ctx.addIssue({ code: "custom", message: `solution のキーが files にありません: ${key}` });
      }
    }
    for (const [name, file] of Object.entries(lesson.files)) {
      const editable = file.editable !== false;
      const hidden = file.hidden === true;
      if (editable && !hidden && !(name in lesson.solution)) {
        ctx.addIssue({ code: "custom", message: `editable なファイルが solution にありません: ${name}` });
      }
    }
  });

export const courseSchema = z
  .object({
    slug: z.string().regex(slugPattern),
    title: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().positive().optional(),
    level: z.enum(["basic", "intermediate", "advanced", "capstone"]).optional(),
    lessons: z.array(z.string().regex(slugPattern)).min(1),
  })
  .superRefine((course, ctx) => {
    const seen = new Set<string>();
    for (const slug of course.lessons) {
      if (seen.has(slug)) {
        ctx.addIssue({ code: "custom", message: `lessons に slug が重複しています: ${slug}` });
      }
      seen.add(slug);
    }
  });
