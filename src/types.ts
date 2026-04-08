import type { History } from "./history.js";
import type { RoutePath } from "./route-types.js";

export type RouteParams = Record<string, string | undefined>;

export type MatchResult = [matched: boolean, params: RouteParams];

export type LooseMatchResult = [matched: boolean, params: RouteParams, base?: string];

export type NavigateFn = (to: RoutePath, options?: import("./history.js").NavigateOptions) => void;

export type RouterContextValue = {
  base: string;
  history: History;
};
