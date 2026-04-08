import { bench, describe } from "vitest";
import { matchPath, matchRoute } from "./matcher.js";

// Warm up the cache for "cached" benchmarks
matchPath("/about", "/about");
matchPath("/users/:id", "/users/1");
matchPath("/files/*", "/files/a");
matchPath("/app", "/app/dashboard", true);

describe("matchPath — cached (hot path)", () => {
  bench("static match /about", () => {
    matchPath("/about", "/about");
  });

  bench("parameterized /users/:id", () => {
    matchPath("/users/:id", "/users/123");
  });

  bench("wildcard /files/*", () => {
    matchPath("/files/*", "/files/a/b/c");
  });

  bench("miss (no match)", () => {
    matchPath("/about", "/other");
  });

  bench("loose matching", () => {
    matchPath("/app", "/app/dashboard", true);
  });
});

describe("matchPath — cold (first match, builds PatternRouter)", () => {
  let counter = 0;

  bench("cold parameterized", () => {
    matchPath(`/cold-${counter++}/:id`, `/cold-${counter}/42`);
  });
});

describe("matchRoute", () => {
  const regex = /^\/foo\/(?<id>\d+)$/;

  bench("string pattern (delegates to matchPath)", () => {
    matchRoute("/users/:id", "/users/99");
  });

  bench("regExp pattern", () => {
    matchRoute(regex, "/foo/42");
  });

  bench("regExp miss", () => {
    matchRoute(regex, "/bar/42");
  });
});

describe("matchPath — cache scaling", () => {
  // Pre-fill cache with 200 patterns
  for (let i = 0; i < 200; i++) {
    matchPath(`/scale-${i}/:id`, `/scale-${i}/1`);
  }

  bench("lookup in 200-entry cache", () => {
    matchPath("/scale-150/:id", "/scale-150/42");
  });
});
