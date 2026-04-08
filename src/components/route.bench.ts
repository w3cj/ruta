import type { RouteParams } from "../types.js";
import { bench, describe } from "vitest";

// --- Extracted comparison strategies (benchmarked standalone, no hooks) ---

const jsonStringifyCompare = (prev: RouteParams, next: RouteParams): boolean =>
  JSON.stringify(prev) !== JSON.stringify(next);

const shallowEqualCompare = (prev: RouteParams, next: RouteParams): boolean => {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length)
    return true;
  for (const key of prevKeys) {
    if (prev[key] !== next[key])
      return true;
  }
  return false;
};

// --- Test data ---

const small = { id: "123" };
const smallSame = { id: "123" };
const smallChanged = { id: "456" };

const medium: RouteParams = {};
const mediumSame: RouteParams = {};
const mediumChanged: RouteParams = {};
for (let i = 0; i < 5; i++) {
  medium[`p${i}`] = `v${i}`;
  mediumSame[`p${i}`] = `v${i}`;
  mediumChanged[`p${i}`] = i === 4 ? "changed" : `v${i}`;
}

const large: RouteParams = {};
const largeSame: RouteParams = {};
const largeChanged: RouteParams = {};
for (let i = 0; i < 20; i++) {
  large[`param${i}`] = `value${i}`;
  largeSame[`param${i}`] = `value${i}`;
  largeChanged[`param${i}`] = i === 19 ? "changed" : `value${i}`;
}

describe("params comparison — JSON.stringify", () => {
  bench("1 param, same", () => {
    jsonStringifyCompare(small, smallSame);
  });

  bench("1 param, changed", () => {
    jsonStringifyCompare(small, smallChanged);
  });

  bench("5 params, same", () => {
    jsonStringifyCompare(medium, mediumSame);
  });

  bench("5 params, changed", () => {
    jsonStringifyCompare(medium, mediumChanged);
  });

  bench("20 params, same", () => {
    jsonStringifyCompare(large, largeSame);
  });

  bench("20 params, changed", () => {
    jsonStringifyCompare(large, largeChanged);
  });
});

describe("params comparison — shallow equality", () => {
  bench("1 param, same", () => {
    shallowEqualCompare(small, smallSame);
  });

  bench("1 param, changed", () => {
    shallowEqualCompare(small, smallChanged);
  });

  bench("5 params, same", () => {
    shallowEqualCompare(medium, mediumSame);
  });

  bench("5 params, changed", () => {
    shallowEqualCompare(medium, mediumChanged);
  });

  bench("20 params, same", () => {
    shallowEqualCompare(large, largeSame);
  });

  bench("20 params, changed", () => {
    shallowEqualCompare(large, largeChanged);
  });
});

describe("params spread cost", () => {
  const parent = { org: "acme" };
  const route = { id: "123", slug: "hello" };

  bench("spread 2 small objects", () => {
    const _merged = { ...parent, ...route };
  });

  bench("spread with 20-param parent", () => {
    const _merged = { ...large, ...route };
  });
});
