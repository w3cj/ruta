import { describe, expect, it } from "vitest";
import { matchPath, matchRoute } from "./matcher.js";

describe("matchPath", () => {
  it("returns { matched: true, params } on match", () => {
    const { matched, params } = matchPath("/users/:id", "/users/123");
    expect(matched).toBe(true);
    expect(params).toEqual({ id: "123" });
  });

  it("returns { matched: false, params: {} } on non-match", () => {
    const { matched, params } = matchPath("/about", "/home");
    expect(matched).toBe(false);
    expect(params).toEqual({});
  });

  it("caches pattern routers across calls", () => {
    matchPath("/cached/:id", "/cached/1");
    const { matched, params } = matchPath("/cached/:id", "/cached/2");
    expect(matched).toBe(true);
    expect(params).toEqual({ id: "2" });
  });
});

describe("matchRoute", () => {
  it("matches string patterns", () => {
    const { matched, params } = matchRoute("/users/:id", "/users/42");
    expect(matched).toBe(true);
    expect(params).toMatchObject({ id: "42" });
  });

  it("matches RegExp patterns", () => {
    const { matched, params } = matchRoute(/^\/custom\/(?<name>[a-z]+)$/, "/custom/hello");
    expect(matched).toBe(true);
    expect(params).toMatchObject({ name: "hello" });
  });
});
