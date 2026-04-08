import type { Child, FC } from "hono/jsx";
import type { ExtractParams } from "../route-types.js";
import type { LooseMatchResult, RouteParams } from "../types.js";
import { useContext, useRef } from "hono/jsx";
import { ParamsContext, RouterContext, useLocationFromRouter, useParams } from "../hooks.js";
import { matchRoute } from "../matcher.js";
import { Router } from "./router.js";

export type RouteProps<T extends string = string> = {
  path?: T;
  nest?: boolean;
  match?: LooseMatchResult;
  component?: () => Child;
  children?: Child | ((params: ExtractParams<T>) => Child);
};

const paramsChanged = (a: RouteParams, b: RouteParams): boolean => {
  const aKeys = Object.keys(a);
  if (aKeys.length !== Object.keys(b).length)
    return true;
  for (const key of aKeys) {
    if (a[key] !== b[key])
      return true;
  }
  return false;
};

const useCachedParams = (value: RouteParams): RouteParams => {
  const prevRef = useRef<RouteParams>(value);
  if (paramsChanged(prevRef.current!, value))
    prevRef.current = value;
  return prevRef.current!;
};

export const Route: FC = <T extends string = string>({ path, nest, match, component: Component, children }: RouteProps<T>) => {
  const router = useContext(RouterContext);
  const { location } = useLocationFromRouter(router);
  const parentParams = useParams();

  const { matched, params: routeParams, base } = match ?? matchRoute(path, location, nest);

  const params = useCachedParams({ ...parentParams, ...routeParams });

  if (!matched)
    return null;

  const content = Component
    ? Component()
    : typeof children === "function"
      ? children(params as ExtractParams<T>)
      : children;

  const wrapped = base
    ? <Router base={base}>{content}</Router>
    : content;

  return (
    <ParamsContext.Provider value={params}>
      {wrapped}
    </ParamsContext.Provider>
  );
};
