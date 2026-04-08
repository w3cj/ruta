import type { NavigateOptions } from "../history.js";
import type { ParamsProp, RoutePath } from "../route-types.js";
import { useLayoutEffect, useRef } from "hono/jsx";
import { resolvePath, useLocation } from "../hooks.js";

export type RedirectProps<T extends RoutePath = RoutePath> = NavigateOptions & {
  to?: T;
  href?: T;
} & ParamsProp<T extends string ? T : string>;

export const Redirect = <T extends RoutePath>(props: RedirectProps<T>): null => {
  const { to, href = to, params } = props as RedirectProps<T> & { params?: Record<string, string> };
  const [, navigate] = useLocation();
  const propsRef = useRef(props);
  propsRef.current = props;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const resolved = href ? resolvePath(href as string, params) : undefined;

  useLayoutEffect(() => {
    if (resolved) {
      navigateRef.current!(resolved, propsRef.current as NavigateOptions ?? undefined);
    }
  }, [resolved]);

  return null;
};
