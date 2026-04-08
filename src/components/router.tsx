import type { Child, FC } from "hono/jsx";
import type { History } from "../history.js";
import type { RouteDefinition, RouteEntry } from "../route-types.js";
import type { RouterContextValue } from "../types.js";
import { useContext, useMemo } from "hono/jsx";
import { setActiveHistory } from "../history.js";
import { RouterContext } from "../hooks.js";
import { Route } from "./route.js";
import { Switch } from "./switch.js";

export type RouterProps = {
  base?: string;
  history?: History;
  routes?: RouteDefinition<any>;
  children?: Child;
};

export const Router: FC = ({ children, routes: routeDef, history: historyProp, ...props }: RouterProps) => {
  const parent = useContext(RouterContext);

  const history = historyProp ?? parent.history;
  const base = (historyProp ? "" : parent.base) + (props.base ?? "");

  if (historyProp)
    setActiveHistory(historyProp);

  const value = useMemo((): RouterContextValue => {
    if (history === parent.history && base === parent.base)
      return parent;
    return { base, history };
  }, [base, history, parent]);

  const content = routeDef
    ? (
        <Switch>
          {routeDef.routes.map((r: RouteEntry) => (
            <Route key={r.path} path={r.path} component={r.component} />
          ))}
        </Switch>
      )
    : children;

  return (
    <RouterContext.Provider value={value}>
      {content}
    </RouterContext.Provider>
  );
};
