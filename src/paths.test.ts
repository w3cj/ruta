import { describe, expect, it } from "vitest";
import { absolutePath, relativePath, sanitizeSearch } from "./hooks.js";

describe("absolutePath", () => {
  it("prepends base to path", () => {
    expect(absolutePath("/dashboard", "/app")).toBe("/app/dashboard");
  });

  it("strips ~ prefix and ignores base", () => {
    expect(absolutePath("~/home", "/app")).toBe("/home");
  });
});

describe("relativePath", () => {
  it("strips base from path", () => {
    expect(relativePath("/app", "/app/dashboard")).toBe("/dashboard");
  });

  it("returns ~/path when base does not match", () => {
    expect(relativePath("/app", "/other")).toBe("~/other");
  });

  it("returns / when path equals base", () => {
    expect(relativePath("/app", "/app")).toBe("/");
  });
});

describe("sanitizeSearch", () => {
  it("strips leading ?", () => {
    expect(sanitizeSearch("?foo=bar")).toBe("foo=bar");
  });

  it("decodes URI components", () => {
    expect(sanitizeSearch("?name=%D1%82%D0%B5%D1%81%D1%82")).toBe("name=тест");
  });

  it("returns string as-is when no leading ?", () => {
    expect(sanitizeSearch("foo=bar")).toBe("foo=bar");
  });
});
