import type { Child, FC } from "hono/jsx";
import { cloneElement, Fragment, isValidElement, useContext } from "hono/jsx";
import { RouterContext, useLocationFromRouter } from "../hooks.js";
import { matchRoute } from "../matcher.js";

export type SwitchProps = {
  children?: Child;
  location?: string;
};

export const Switch: FC = ({ children, location }: SwitchProps) => {
  const loc = useLocationFromRouter(useContext(RouterContext)).location;
  const path = location || loc;
  const stack: Child[] = Array.isArray(children) ? [...children] : [children];
  let i = 0;
  while (i < stack.length) {
    const child = stack[i++];

    if (Array.isArray(child)) {
      stack.push(...child);
      continue;
    }

    if (child && typeof child === "object" && "type" in child && child.type === Fragment) {
      stack.push(child.props.children as Child);
      continue;
    }

    if (!isValidElement(child))
      continue;

    const c = child as any;
    if (typeof c.type === "string" && c.props.path == null)
      continue;

    const match = matchRoute(c.props.path, path, c.props.nest);
    if (match.matched)
      return cloneElement(c, { match } as any) as ReturnType<FC>;
  }

  return null as ReturnType<FC>;
};
