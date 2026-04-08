import { Fragment } from "hono/jsx";
import { bench, describe } from "vitest";
import { matchRoute } from "../matcher.js";

// --- Single-pass findMatch (mirrors switch.tsx implementation) ---

type Child = any;

const findMatch = (children: Child, path: string): Child | null => {
  const stack: Child[] = Array.isArray(children) ? [...children] : [children];
  let i = 0;
  while (i < stack.length) {
    const child = stack[i++];
    if (Array.isArray(child)) {
      stack.push(...child);
      continue;
    }
    if (child && typeof child === "object" && "type" in child && child.type === Fragment) {
      const nested = child.props.children;
      if (Array.isArray(nested))
        stack.push(...nested);
      else
        stack.push(nested);
      continue;
    }
    if (!child || typeof child !== "object" || !("props" in child))
      continue;
    if (typeof child.type === "string" && child.props.path == null)
      continue;
    const match = matchRoute(child.props.path, path, child.props.nest);
    if (match.matched)
      return child;
  }
  return null;
};

// --- Mock JSX elements ---

const makeRoute = (path: string) => ({
  type: "Route",
  props: { path, nest: false },
  key: null,
});

const makeFragment = (children: Child[]) => ({
  type: Fragment,
  props: { children },
  key: null,
});

const flat5 = Array.from({ length: 5 }, (_, i) => makeRoute(`/route-${i}`));
const flat20 = Array.from({ length: 20 }, (_, i) => makeRoute(`/route-${i}`));
const flat100 = Array.from({ length: 100 }, (_, i) => makeRoute(`/route-${i}`));

const nested = makeFragment([
  makeRoute("/a"),
  makeFragment([
    makeRoute("/b"),
    makeFragment([makeRoute("/c"), makeRoute("/d")]),
  ]),
  makeRoute("/e"),
]);

const mixed = [
  null,
  "text",
  makeRoute("/first"),
  makeFragment([makeRoute("/second"), null, makeRoute("/third")]),
  makeRoute("/fourth"),
];

// Warm up matcher cache
for (const list of [flat5, flat20, flat100]) {
  for (const el of list) {
    matchRoute(el.props.path, "/warmup");
  }
}

describe("findMatch — single pass", () => {
  bench("5 flat routes, first match", () => {
    findMatch(flat5, "/route-0");
  });

  bench("5 flat routes, last match", () => {
    findMatch(flat5, "/route-4");
  });

  bench("20 flat routes, first match", () => {
    findMatch(flat20, "/route-0");
  });

  bench("20 flat routes, last match", () => {
    findMatch(flat20, "/route-19");
  });

  bench("20 flat routes, no match", () => {
    findMatch(flat20, "/nonexistent");
  });

  bench("100 flat routes, first match", () => {
    findMatch(flat100, "/route-0");
  });

  bench("100 flat routes, last match", () => {
    findMatch(flat100, "/route-99");
  });

  bench("100 flat routes, no match", () => {
    findMatch(flat100, "/nonexistent");
  });

  bench("nested fragments (3 levels)", () => {
    findMatch(nested, "/d");
  });

  bench("mixed (nulls, strings, fragments)", () => {
    findMatch(mixed, "/fourth");
  });
});
