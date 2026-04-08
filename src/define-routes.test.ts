import type { Child } from "hono/jsx";
import { describe, expect, expectTypeOf, it } from "vitest";
import { defineRoutes, resolvePath } from "./hooks.js";

describe("resolvePath", () => {
  it("returns pattern unchanged when no params", () => {
    expect(resolvePath("/about")).toBe("/about");
  });

  it("returns pattern unchanged when params is undefined", () => {
    expect(resolvePath("/users/:id", undefined)).toBe("/users/:id");
  });

  it("substitutes single param", () => {
    expect(resolvePath("/users/:id", { id: "42" })).toBe("/users/42");
  });

  it("substitutes multiple params", () => {
    expect(resolvePath("/posts/:year/:slug", { year: "2026", slug: "hello" })).toBe("/posts/2026/hello");
  });

  it("substitutes wildcard", () => {
    expect(resolvePath("/files/*", { "*": "a/b/c" })).toBe("/files/a/b/c");
  });

  it("handles optional param present", () => {
    expect(resolvePath("/:title?", { title: "hello" })).toBe("/hello");
  });

  it("handles optional param absent", () => {
    expect(resolvePath("/:title?", {})).toBe("/");
  });

  it("collapses double slashes", () => {
    expect(resolvePath("/users/:id/posts", { id: "" })).toBe("/users/posts");
  });

  it("returns / for empty result", () => {
    expect(resolvePath("/:only?", {})).toBe("/");
  });
});

describe("defineRoutes", () => {
  const Home = (): Child => null;
  const User = (_params: { id: string }): Child => null;
  const Post = (_params: { year: string; slug: string }): Child => null;

  it("returns routes array with correct entries", () => {
    const routes = defineRoutes(route => [
      route("/", Home),
      route("/users/:id", User),
    ]);

    expect(routes.routes).toHaveLength(2);
    expect(routes.routes[0].path).toBe("/");
    expect(routes.routes[0].component).toBe(Home);
    expect(routes.routes[1].path).toBe("/users/:id");
    expect(routes.routes[1].component).toBe(User);
  });

  it("returns types object with route paths as keys", () => {
    const routes = defineRoutes(route => [
      route("/", Home),
      route("/users/:id", User),
      route("/posts/:year/:slug", Post),
    ]);

    expect(routes.types).toEqual({
      "/": true,
      "/users/:id": true,
      "/posts/:year/:slug": true,
    });
  });

  it("infers path literal types", () => {
    const routes = defineRoutes(route => [
      route("/", Home),
      route("/users/:id", User),
    ]);

    expectTypeOf(routes.routes[0].path).toEqualTypeOf<"/">();
    expectTypeOf(routes.routes[1].path).toEqualTypeOf<"/users/:id">();
  });

  it("types object matches route paths", () => {
    const routes = defineRoutes(route => [
      route("/", Home),
      route("/users/:id", User),
    ]);

    expectTypeOf(routes.types).toEqualTypeOf<{ "/": true; "/users/:id": true }>();
  });
});
