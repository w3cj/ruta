import type { History } from "./history.js";

export type RouteParams = Record<string, string | undefined>;

export type MatchResult = [matched: boolean, params: RouteParams];

export type LooseMatchResult = [matched: boolean, params: RouteParams, base?: string];

export type NavigateFn = (to: string, options?: import("./history.js").NavigateOptions) => void;

export type RouterContextValue = {
  base: string;
  history: History;
};
