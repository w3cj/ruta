export { Link } from "./components/link.js";
export { Redirect } from "./components/redirect.js";
export { Route } from "./components/route.js";
export { Router } from "./components/router.js";
export { Switch } from "./components/switch.js";

export {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from "./history.js";

export type {
  History,
  MemoryHistory,
  MemoryHistoryOptions,
  NavigateOptions,
} from "./history.js";

export {
  absolutePath,
  defineRoutes,
  navigate,
  relativePath,
  resolvePath,
  sanitizeSearch,
  useLocation,
  useParams,
  useRoute,
  useRouter,
  useSearch,
  useSearchParams,
} from "./hooks.js";

export { matchPath, matchRoute } from "./matcher.js";

export type {
  ExtractParams,
  ParamsOf,
  RouteDefinition,
  RouteMap,
  RoutePath,
  StrictRoutePath,
  TypedMatchResult,
} from "./route-types.js";

export type {
  LooseMatchResult,
  MatchResult,
  NavigateFn,
  RouteParams,
  RouterContextValue,
} from "./types.js";
