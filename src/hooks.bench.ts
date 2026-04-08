import { bench, describe } from "vitest";
import { absolutePath, relativePath, sanitizeSearch } from "./hooks.js";

describe("absolutePath", () => {
  bench("with base", () => {
    absolutePath("/dashboard", "/app");
  });

  bench("tilde prefix (bypass base)", () => {
    absolutePath("~/home", "/app");
  });

  bench("empty base", () => {
    absolutePath("/page", "");
  });
});

describe("relativePath", () => {
  bench("matching base", () => {
    relativePath("/app", "/app/dashboard");
  });

  bench("non-matching base", () => {
    relativePath("/app", "/other/page");
  });

  bench("exact base match (returns /)", () => {
    relativePath("/app", "/app");
  });

  bench("long base path", () => {
    relativePath("/org/acme/project/alpha", "/org/acme/project/alpha/settings/general");
  });
});

describe("sanitizeSearch", () => {
  bench("with leading ?", () => {
    sanitizeSearch("?foo=bar&baz=1");
  });

  bench("without leading ?", () => {
    sanitizeSearch("foo=bar&baz=1");
  });

  bench("encoded characters", () => {
    sanitizeSearch("?name=%D1%82%D0%B5%D1%81%D1%82&q=%E4%B8%AD%E6%96%87");
  });

  bench("empty string", () => {
    sanitizeSearch("");
  });
});

describe("urlSearchParams construction", () => {
  bench("empty", () => {
    const _p = new URLSearchParams("");
  });

  bench("short query (2 params)", () => {
    const _p = new URLSearchParams("foo=bar&page=1");
  });

  bench("long query (10 params)", () => {
    const _p = new URLSearchParams("a=1&b=2&c=3&d=4&e=5&f=6&g=7&h=8&i=9&j=10");
  });

  bench("full pipeline: sanitize + parse", () => {
    const _p = new URLSearchParams(sanitizeSearch("?foo=bar&page=1&sort=name"));
  });
});
