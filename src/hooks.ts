import type { Child } from "hono/jsx";
import type { NavigateOptions } from "./history.js";
import type { ExtractParams, ParamsProp, RouteDefinition, RouteEntry, RoutePath, TypedMatchResult } from "./route-types.js";
import type { NavigateFn, RouteParams, RouterContextValue } from "./types.js";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "hono/jsx";
import { getActiveHistory } from "./history.js";
import { matchRoute } from "./matcher.js";

// --- Paths ---

const normalizeBase = (base?: string): string => base === "/" ? "" : (base ?? "");

const safeDecode = (str: string): string => {
  try {
    return decodeURI(str);
  }
  catch {
    return str;
  }
};

export const absolutePath = (to: string, base: string): string =>
  to.startsWith("~") ? to.substring(1) : normalizeBase(base) + to;

export const relativePath = (base: string | undefined, path: string): string => {
  const b = safeDecode(normalizeBase(base));
  const p = safeDecode(path);
  if (b && p.toLowerCase().startsWith(b.toLowerCase()))
    return p.substring(b.length) || "/";
  return b ? `~${p}` : p || "/";
};

export const sanitizeSearch = (search: string): string =>
  safeDecode(search.startsWith("?") ? search.substring(1) : search);

// --- Path resolution ---

const PARAM_RE = /:(\w+)\??/g;
const WILDCARD_RE = /\*/g;
const MULTI_SLASH_RE = /\/+/g;
const TRAILING_SLASH_RE = /\/$/;

export const resolvePath = (pattern: string, params?: Record<string, string>): string => {
  if (!params)
    return pattern;
  return (pattern
    .replace(PARAM_RE, (_, key) => params[key] ?? "")
    .replace(WILDCARD_RE, () => params["*"] ?? "")
    .replace(MULTI_SLASH_RE, "/")
    .replace(TRAILING_SLASH_RE, "")) || "/";
};

// --- Route definition ---

const routeEntry = <const P extends string>(
  path: P,
  component: () => Child,
): RouteEntry<P> => ({ path, component });

export const defineRoutes = <const T extends readonly RouteEntry[]>(
  fn: (route: typeof routeEntry) => [...T],
): RouteDefinition<T> => {
  const routes = fn(routeEntry);
  return {
    routes,
    types: Object.fromEntries(routes.map(r => [r.path, true])) as RouteDefinition<T>["types"],
  };
};

// --- Navigate (standalone, delegates to active history) ---

export const navigate = <T extends RoutePath>(
  to: T,
  options?: NavigateOptions & ParamsProp<T extends string ? T : string>,
): void => {
  const resolved = resolvePath(to, (options as any)?.params);
  getActiveHistory().navigate(resolved, options);
};

// --- Context ---

const defaultRouter: RouterContextValue = {
  base: "",
  history: getActiveHistory(),
};

export const RouterContext = createContext<RouterContextValue>(defaultRouter);
export const ParamsContext = createContext<RouteParams>({});

// --- Hooks ---

export const useRouter = (): RouterContextValue => useContext(RouterContext);

export const useParams = <T extends string = string>(): ExtractParams<T> => useContext(ParamsContext) as ExtractParams<T>;

export const useLocationFromRouter = (router: RouterContextValue): [string, NavigateFn] => {
  const { history, base } = router;
  const loc = useSyncExternalStore(history.subscribe, history.location);
  return [
    relativePath(base, loc),
    (to, opts) => history.navigate(absolutePath(to, base), opts),
  ];
};

export const useLocation = (): [string, NavigateFn] => useLocationFromRouter(useContext(RouterContext));

export const useSearch = (): string => {
  const { history } = useContext(RouterContext);
  return sanitizeSearch(useSyncExternalStore(history.subscribe, history.search));
};

export const useRoute = <T extends string>(pattern: T | RegExp): TypedMatchResult<T> => {
  const [path] = useLocation();
  const result = matchRoute(pattern, path);
  return [result[0], result[1]] as TypedMatchResult<T>;
};

export type SetSearchParams = (
  next: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  options?: NavigateOptions,
) => void;

export const useSearchParams = (): [URLSearchParams, SetSearchParams] => {
  const [loc, nav] = useLocation();
  const search = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams: SetSearchParams = useCallback((nextInit, options) => {
    const next = new URLSearchParams(
      typeof nextInit === "function" ? nextInit(searchParams) : nextInit,
    );
    nav(`${loc}?${next}`, options);
  }, [loc, nav, searchParams]);

  return [searchParams, setSearchParams];
};
