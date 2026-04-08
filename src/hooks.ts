import type { Child } from "hono/jsx";
import type { NavigateOptions } from "./history.js";
import type { ExtractParams, ParamsProp, RouteDefinition, RouteEntry, RoutePath, TypedMatchResult } from "./route-types.js";
import type { NavigateFn, RouteParams, RouterContextValue } from "./types.js";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "hono/jsx";
import { getActiveHistory } from "./history.js";
import { matchRoute } from "./matcher.js";

// --- Paths ---

const nb = (base?: string): string => base === "/" ? "" : (base ?? "");

const sd = (str: string): string => {
  try {
    return decodeURI(str);
  }
  catch {
    return str;
  }
};

export const absolutePath = (to: string, base: string): string =>
  to.startsWith("~") ? to.slice(1) : nb(base) + to;

export const relativePath = (base: string | undefined, path: string): string => {
  const b = sd(nb(base));
  const p = sd(path);
  if (b && p.toLowerCase().startsWith(b.toLowerCase()))
    return p.slice(b.length) || "/";
  return b ? `~${p}` : p || "/";
};

export const sanitizeSearch = (search: string): string =>
  sd(search.startsWith("?") ? search.slice(1) : search);

// --- Path resolution ---

export const resolvePath = (pattern: string, params?: Record<string, string>): string => {
  if (!params)
    return pattern;
  return (pattern
    .replace(/:(\w+)\??|\*/g, (_, key) => (key ? params[key] : params["*"]) ?? "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")) || "/";
};

// --- Route definition ---

const re = <const P extends string>(path: P, component: () => Child): RouteEntry<P> => ({ path, component });

export const defineRoutes = <const T extends readonly RouteEntry[]>(
  fn: (route: typeof re) => [...T],
): RouteDefinition<T> => {
  const routes = fn(re);
  return {
    routes,
    types: Object.fromEntries(routes.map(r => [r.path, true])) as RouteDefinition<T>["types"],
  };
};

// --- Navigate (standalone, delegates to active history) ---

export const navigate = <T extends RoutePath>(
  to: T,
  options?: NavigateOptions & ParamsProp<T extends string ? T : string>,
): void => getActiveHistory().navigate(resolvePath(to, (options as any)?.params), options);

// --- Context ---

export const RouterContext = createContext<RouterContextValue>({ base: "", history: getActiveHistory() });
export const ParamsContext = createContext<RouteParams>({});

// --- Hooks ---

export const useRouter = (): RouterContextValue => useContext(RouterContext);

export const useParams = <T extends string = string>(): ExtractParams<T> => useContext(ParamsContext) as ExtractParams<T>;

export const useLocationFromRouter = (router: RouterContextValue): { location: string; navigate: NavigateFn } => {
  const { history, base } = router;
  const loc = useSyncExternalStore(history.subscribe, history.location);
  return {
    location: relativePath(base, loc),
    navigate: (to, opts) => history.navigate(absolutePath(to, base), opts),
  };
};

export const useLocation = (): { location: string; navigate: NavigateFn } => useLocationFromRouter(useContext(RouterContext));

export const useSearch = (): string => {
  const { history } = useContext(RouterContext);
  return sanitizeSearch(useSyncExternalStore(history.subscribe, history.search));
};

export const useRoute = <T extends string>(pattern: T | RegExp): TypedMatchResult<T> => {
  const { location } = useLocation();
  return matchRoute(pattern, location) as TypedMatchResult<T>;
};

export type SetSearchParams = (
  next: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  options?: NavigateOptions,
) => void;

export const useSearchParams = (): { params: URLSearchParams; setParams: SetSearchParams } => {
  const { location, navigate } = useLocation();
  const search = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams: SetSearchParams = useCallback((nextInit, options) => {
    const next = new URLSearchParams(
      typeof nextInit === "function" ? nextInit(searchParams) : nextInit,
    );
    navigate(`${location}?${next}`, options);
  }, [location, navigate, searchParams]);

  return { params: searchParams, setParams: setSearchParams };
};
