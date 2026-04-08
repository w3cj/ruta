import type { LooseMatchResult, RouteParams } from "./types.js";
import { PatternRouter } from "hono/router/pattern-router";

const cache = new Map<string, PatternRouter<true>>();
const TRAILING_SLASH = /\/$/;
const WILDCARD_KEY = "$w";

// Rewrite bare `*` and trailing `/*` to Hono's named-capture syntax `:key{.*}`
// so the matched value is exposed in params.
const rewriteWildcard = (pattern: string): string => {
  if (pattern === "*")
    return `/:${WILDCARD_KEY}{.*}`;
  if (pattern.endsWith("/*"))
    return `${pattern.slice(0, -2)}/:${WILDCARD_KEY}{.*}`;
  return pattern;
};

const execRegex = (pattern: RegExp, path: string, keys: string[] | false, loose?: boolean): LooseMatchResult => {
  const execResult = pattern.exec(path);
  if (!execResult)
    return { matched: false, params: {} };

  const [$base, ...matches] = execResult;
  const params: RouteParams = {};
  if (keys && keys.length > 0) {
    keys.forEach((key, i) => {
      params[key] = matches[i];
    });
  }
  else if (execResult.groups) {
    Object.assign(params, execResult.groups);
  }
  matches.forEach((m, i) => {
    params[i] = m;
  });

  return { matched: true, params, ...(loose ? { base: $base } : {}) };
};

export const matchPath = (pattern: string, path: string, loose?: boolean): LooseMatchResult => {
  const cacheKey = loose ? `${pattern}:loose` : pattern;
  let router = cache.get(cacheKey);
  if (!router) {
    router = new PatternRouter<true>();
    if (loose) {
      router.add("GET", rewriteWildcard(`${pattern}/*`), true);
      router.add("GET", pattern, true);
    }
    else {
      router.add("GET", rewriteWildcard(pattern), true);
    }
    cache.set(cacheKey, router);
  }
  const [[result]] = router.match("GET", path);
  if (!result) {
    return { matched: false, params: {} };
  }
  const params = result[1] as RouteParams;
  // Extract the internal wildcard capture and expose it as "*"
  const wildcard = params[WILDCARD_KEY];
  delete params[WILDCARD_KEY];
  if (wildcard !== undefined) {
    params["*"] = wildcard;
  }
  if (loose) {
    const base = wildcard
      ? path.slice(0, path.length - wildcard.length - 1)
      : path.replace(TRAILING_SLASH, "");
    delete params["*"];
    return { matched: true, params, base };
  }
  return { matched: true, params };
};

export const matchRoute = (route: string | RegExp | undefined, path: string, loose?: boolean): LooseMatchResult => {
  if (route instanceof RegExp)
    return execRegex(route, path, false, loose);

  return matchPath(route || "*", path, loose);
};
