import type { Child, FC } from "hono/jsx";
import { cloneElement, Fragment, isValidElement, useContext } from "hono/jsx";
import { RouterContext, useLocationFromRouter } from "../hooks.js";
import { matchRoute } from "../matcher.js";

export type SwitchProps = {
  children?: Child;
  location?: string;
};

const findMatch = (children: Child, path: string): Child | null => {
  const stack: Child[] = Array.isArray(children) ? [...children] : [children];
  let i = 0;
  while (i < stack.length) {
    const child = stack[i++];

    // Unwrap arrays inline
    if (Array.isArray(child)) {
      stack.push(...child);
      continue;
    }

    // Unwrap Fragments inline
    if (child && typeof child === "object" && "type" in child && child.type === Fragment) {
      const nested = child.props.children;
      if (Array.isArray(nested))
        stack.push(...nested);
      else
        stack.push(nested);
      continue;
    }

    if (!isValidElement(child))
      continue;

    // Skip plain HTML elements without a path prop
    if (typeof (child as any).type === "string" && (child as any).props.path == null)
      continue;

    const match = matchRoute(
      (child as any).props.path,
      path,
      (child as any).props.nest,
    );

    if (match.matched)
      return cloneElement(child as any, { match } as any) as Child;
  }

  return null;
};

export const Switch: FC = ({ children, location }: SwitchProps) => {
  const router = useContext(RouterContext);
  const { location: originalLocation } = useLocationFromRouter(router);
  return findMatch(children, location || originalLocation) as ReturnType<FC>;
};
