import type { LooseMatchResult, RouteParams } from "./types.js";
import { PatternRouter } from "hono/router/pattern-router";

const cache = new Map<string, PatternRouter<true>>();
const WK = "$w";
const NOMATCH: LooseMatchResult = { matched: false, params: {} };

const rw = (p: string): string =>
  p === "*" ? `/:${WK}{.*}` : p.endsWith("/*") ? `${p.slice(0, -2)}/:${WK}{.*}` : p;

export const matchPath = (pattern: string, path: string, loose?: boolean): LooseMatchResult => {
  const cacheKey = loose ? `${pattern}:loose` : pattern;
  let router = cache.get(cacheKey);
  if (!router) {
    router = new PatternRouter<true>();
    if (loose)
      router.add("GET", rw(`${pattern}/*`), true);
    router.add("GET", loose ? pattern : rw(pattern), true);
    cache.set(cacheKey, router);
  }
  const [[result]] = router.match("GET", path);
  if (!result)
    return NOMATCH;
  const params = result[1] as RouteParams;
  const wildcard = params[WK];
  delete params[WK];
  if (wildcard !== undefined)
    params["*"] = wildcard;
  if (loose) {
    const base = wildcard
      ? path.slice(0, path.length - wildcard.length - 1)
      : path.replace(/\/$/, "");
    delete params["*"];
    return { matched: true, params, base };
  }
  return { matched: true, params };
};

export const matchRoute = (route: string | RegExp | undefined, path: string, loose?: boolean): LooseMatchResult => {
  if (route instanceof RegExp) {
    const r = route.exec(path);
    if (!r)
      return NOMATCH;
    const params: RouteParams = { ...r.groups };
    for (let i = 1; i < r.length; i++)
      params[i - 1] = r[i];
    return { matched: true, params, ...(loose ? { base: r[0] } : {}) };
  }
  return matchPath(route || "*", path, loose);
};
