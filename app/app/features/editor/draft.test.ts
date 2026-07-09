import { describe, expect, it } from "vitest";
import {
  clearDraft,
  draftKey,
  editableSubset,
  type LessonFileMap,
  loadDraft,
  restoreFiles,
  type StorageLike,
  saveDraft,
} from "./draft";

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { dump: Map<string, string> } {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    dump: map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

const lessonFiles: LessonFileMap = {
  "index.html": { initial: "<h1></h1>", editable: true, hidden: false },
  "style.css": { initial: "h1 { }", editable: false, hidden: false },
  "base.js": { initial: "// base", editable: true, hidden: true },
};

describe("draftKey", () => {
  it("draft:{lessonSlug} 形式", () => {
    expect(draftKey("html-01-intro")).toBe("draft:html-01-intro");
  });
});

describe("saveDraft / loadDraft", () => {
  it("保存した内容と savedAt を往復できる", () => {
    const storage = memoryStorage();
    saveDraft(storage, "html-01", { "index.html": "<h1>hi</h1>" }, 1234);
    expect(loadDraft(storage, "html-01")).toEqual({
      files: { "index.html": "<h1>hi</h1>" },
      savedAt: 1234,
    });
  });

  it("未保存なら null", () => {
    expect(loadDraft(memoryStorage(), "html-01")).toBeNull();
  });

  it("壊れた JSON は null", () => {
    const storage = memoryStorage({ "draft:html-01": "{oops" });
    expect(loadDraft(storage, "html-01")).toBeNull();
  });

  it("形が不正(savedAt が文字列)なら null", () => {
    const storage = memoryStorage({
      "draft:html-01": JSON.stringify({ files: {}, savedAt: "yesterday" }),
    });
    expect(loadDraft(storage, "html-01")).toBeNull();
  });

  it("files 内の文字列でない値は捨てる", () => {
    const storage = memoryStorage({
      "draft:html-01": JSON.stringify({ files: { a: "ok", b: 42 }, savedAt: 1 }),
    });
    expect(loadDraft(storage, "html-01")).toEqual({ files: { a: "ok" }, savedAt: 1 });
  });

  it("storage が throw しても落ちない", () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadDraft(broken, "x")).toBeNull();
    expect(() => saveDraft(broken, "x", {})).not.toThrow();
    expect(() => clearDraft(broken, "x")).not.toThrow();
  });
});

describe("clearDraft", () => {
  it("キーを削除する", () => {
    const storage = memoryStorage();
    saveDraft(storage, "html-01", { "index.html": "draft" });
    clearDraft(storage, "html-01");
    expect(loadDraft(storage, "html-01")).toBeNull();
  });
});

describe("restoreFiles", () => {
  it("draft なしは initial(hidden 含む全ファイル)", () => {
    expect(restoreFiles(lessonFiles, null)).toEqual({
      "index.html": "<h1></h1>",
      "style.css": "h1 { }",
      "base.js": "// base",
    });
  });

  it("editable のみ draft の値で復元する(editable:false は initial のまま)", () => {
    const restored = restoreFiles(lessonFiles, {
      files: { "index.html": "<h1>draft</h1>", "style.css": "h1 { color: red }" },
      savedAt: 1,
    });
    expect(restored["index.html"]).toBe("<h1>draft</h1>");
    expect(restored["style.css"]).toBe("h1 { }");
  });

  it("hidden でも editable なら復元する", () => {
    const restored = restoreFiles(lessonFiles, {
      files: { "base.js": "// drafted" },
      savedAt: 1,
    });
    expect(restored["base.js"]).toBe("// drafted");
  });

  it("教材に存在しない下書きキーは無視する", () => {
    const restored = restoreFiles(lessonFiles, {
      files: { "old.html": "<p>stale</p>" },
      savedAt: 1,
    });
    expect(Object.keys(restored).sort()).toEqual(["base.js", "index.html", "style.css"]);
  });
});

describe("editableSubset", () => {
  it("editable なファイルだけを現在値で返す", () => {
    const subset = editableSubset(lessonFiles, {
      "index.html": "<h1>now</h1>",
      "style.css": "h1 { color: red }",
      "base.js": "// now",
    });
    expect(subset).toEqual({ "index.html": "<h1>now</h1>", "base.js": "// now" });
  });

  it("現在値が欠けているファイルはスキップする", () => {
    expect(editableSubset(lessonFiles, {})).toEqual({});
  });
});
