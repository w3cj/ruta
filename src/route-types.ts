import type { Child } from "hono/jsx";

// --- Route registration ---

// eslint-disable-next-line ts/consistent-type-definitions
export interface Register {}

// --- Param extraction ---

export type ExtractParams<T extends string>
  = T extends `${string}:${infer Param}/${infer Rest}`
    ? (Param extends `${infer P}?`
      ? { [K in P]?: string }
      : { [K in Param]: string })
    & ExtractParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? (Param extends `${infer P}?`
          ? { [K in P]?: string }
          : { [K in Param]: string })
      : T extends `${string}*`
        ? { "*": string }
        // eslint-disable-next-line ts/no-empty-object-type -- intentional: represents "no params"
        : {};

// --- Path types ---

export type RoutePath = HasRoutes extends true
  ? (keyof RegisteredRouteMap & string) | (string & {})
  : string;

export type StrictRoutePath = HasRoutes extends true
  ? keyof RegisteredRouteMap & string
  : string;

export type ParamsOf<T extends string> = ExtractParams<T>;

export type TypedMatchResult<T extends string> = {
  matched: boolean;
  params: ExtractParams<T>;
};

// --- Params prop helper ---

type IsEmptyObject<T> = keyof T extends never ? true : false;

export type ParamsProp<T extends string>
  = IsEmptyObject<ExtractParams<T>> extends true
    ? { params?: never }
    : { params: ExtractParams<T> };

// --- defineRoutes types ---

export type RouteEntry<P extends string = string> = {
  path: P;
  component: () => Child;
};

type PathsToMap<T extends readonly RouteEntry[]> = {
  [K in T[number]["path"]]: true;
};

export type RouteDefinition<T extends readonly RouteEntry[]> = {
  readonly routes: T;
  readonly types: PathsToMap<T>;
};

// --- Derived route map ---

type RegisteredRouteMap = Register extends { routes: infer R extends RouteDefinition<any> }
  ? R["types"]
  // eslint-disable-next-line ts/no-empty-object-type
  : {};

type HasRoutes = keyof RegisteredRouteMap extends never ? false : true;
