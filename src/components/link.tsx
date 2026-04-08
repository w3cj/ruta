import type { Child, FC } from "hono/jsx";
import type { NavigateOptions } from "../history.js";
import type { ParamsProp, RoutePath } from "../route-types.js";
import { cloneElement, isValidElement, useContext } from "hono/jsx";
import { resolvePath, RouterContext, useLocationFromRouter } from "../hooks.js";

export type LinkProps<T extends RoutePath = RoutePath> = {
  to?: T;
  href?: T;
} & ParamsProp<T extends string ? T : string> & {
  replace?: boolean;
  state?: unknown;
  transition?: boolean;
  asChild?: boolean;
  children?: Child;
  class?: string;
  className?: string | ((isActive: boolean) => string);
  onClick?: (e: MouseEvent) => void;
};

export const Link: FC = <T extends RoutePath>(props: LinkProps<T>) => {
  const {
    to = "" as T,
    href: targetPath = to,
    params,
    onClick: _onClick,
    asChild,
    children,
    className: cls,
    replace: _replace,
    state: _state,
    transition: _transition,
    ...restProps
  } = props as LinkProps<T> & { params?: Record<string, string> };

  const router = useContext(RouterContext);
  const { location: currentPath, navigate } = useLocationFromRouter(router);

  const resolved = resolvePath(targetPath as string, params);

  const handleClick = (e: MouseEvent): void => {
    if (
      e.ctrlKey
      || e.metaKey
      || e.altKey
      || e.shiftKey
      || e.button !== 0
    ) {
      return;
    }

    if (_onClick)
      _onClick(e);
    if (!e.defaultPrevented) {
      e.preventDefault();
      navigate(resolved, props as NavigateOptions);
    }
  };

  // Handle nested routers and absolute paths
  const href = router.history.createHref(
    resolved[0] === "~" ? resolved.slice(1) : router.base + resolved,
  );

  // className can be a function that receives active state
  const className = typeof cls === "function"
    ? cls(currentPath === resolved)
    : cls;

  if (asChild && isValidElement(children)) {
    return cloneElement(children as any, { onClick: handleClick, href } as any);
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...restProps}>
      {children}
    </a>
  );
};
