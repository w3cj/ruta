# ruta

A tiny type-safe client-side router for [hono/jsx](https://hono.dev/docs/guides/jsx-dom) client components.

Zero dependencies, only **2.51 KB** with brotli compression.

Inspired by [wouter](https://github.com/molefrog/wouter) and [@tanstack/react-router](https://tanstack.com/router/latest)

## Install

```bash
pnpm install @w3cj/ruta
```

## Quick Start

Define routes with `defineRoutes` and register them via module augmentation. All route-aware APIs (`Link`, `navigate`, `useRoute`, `useParams`, etc.) get typed automatically.

```tsx
// src/routes.ts
import { defineRoutes, useParams } from "@w3cj/ruta";
import { Home, Post, User } from "./pages";

export const routes = defineRoutes(route => [
  route("/", Home),
  route("/users/:id", User),
  route("/posts/:year/:slug", Post),
]);
```

Register route types globally at the bottom of the same file:

```ts
declare module "@w3cj/ruta" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    routes: typeof routes;
  }
}
```

> When `Register` is not augmented, all APIs accept plain strings and `params` are optional.

### `<Router routes={routes} />`

Pass the route definition to `Router`

```tsx
import { Router } from "@w3cj/ruta";
import { routes } from "./routes";

const App = () => <Router routes={routes} />;
```

#### Page components used in the example

```tsx
// src/pages.ts
export const Home = () => <h1>Home</h1>;

export const User = () => {
  const { id } = useParams<"/users/:id">();
  return (
    <h1>
      User
      {id}
    </h1>
  );
};

export const Post = () => {
  const { year, slug } = useParams<"/posts/:year/:slug">();
  return (
    <h1>
      Post
      {year}
      {" - "}
      {slug}
    </h1>
  );
};
```

### `<Link>` with typed params

The `to` prop gets autocomplete for registered routes. When a route has parameters, the `params` prop is required.

```tsx
import { Link } from "@w3cj/ruta";

<Link to="/about" />;
```

```tsx
<Link to="/users/:id" params={{ id: "42" }} />;
```

### `navigate` with typed params

```tsx
import { navigate } from "@w3cj/ruta";

navigate("/about");
navigate("/users/:id", { params: { id: "42" } });
navigate("/users/:id", { params: { id: "42" }, replace: true });
```

### `<Redirect>` with typed params

```tsx
import { Redirect } from "@w3cj/ruta";

<Redirect to="/about" />;
```

```tsx
<Redirect to="/users/:id" params={{ id: "42" }} />;
```

### `useParams`

Pass a route pattern as a generic to get typed params.

```tsx
import { useParams } from "@w3cj/ruta";

const { id } = useParams<"/users/:id">(); // { id: string }
```

### `useRoute`

Returns a typed match result.

```tsx
import { useRoute } from "@w3cj/ruta";

const { matched, params } = useRoute("/posts/:year/:slug");
// params: { year: string; slug: string }
```

### `<Route>` with typed callbacks

TypeScript infers param types from the `path` prop when using a render function.

```tsx
import { Route } from "@w3cj/ruta";

<Route path="/users/:id">
  {params => (
    <h1>
      User
      {params.id}
    </h1>
  )}
</Route>;
```

## History Types

Ruta supports three history types. Browser history is the default — pass a different history to `Router` to switch modes.

### Browser (default)

Uses the browser History API. No configuration needed.

```tsx
<Router>
  <App />
</Router>;
```

### Hash

Uses hash-based URLs (`/#/about`). Useful when your server doesn't support rewrites to index.html.

```tsx
import { createHashHistory } from "@w3cj/ruta";

<Router history={createHashHistory()}>
  <App />
</Router>;
```

### Memory

In-memory routing for testing or non-browser environments.

```ts
import { createMemoryHistory } from "@w3cj/ruta";

const mem = createMemoryHistory({ path: "/initial", record: true });
```

```tsx
<Router history={mem}>
  <App />
</Router>;
```

```ts
mem.navigate("/next");
console.log(mem.entries); // ["/initial", "/next"]
mem.reset!();
```

## Components

### `<Route>`

Renders when the path matches.

```tsx
<Route path="/about" component={About} />;
```

```tsx
<Route path="/about">
  <h1>About</h1>
</Route>;
```

```tsx
<Route path="/users/:id" component={User} />;
```

```tsx
// Nested routing
<Route path="/app" nest>
  <Route path="/dashboard" component={Dashboard} />
  <Route path="/settings" component={Settings} />
</Route>;
```

### `<Switch>`

Renders the first matching route.

```tsx
<Switch>
  <Route path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="*" component={NotFound} />
</Switch>;
```

### `<Link>`

Navigates without a full page reload.

```tsx
<Link href="/about">About</Link>;
```

```tsx
<Link href="/login" replace>Log in</Link>;
```

```tsx
<Link href="/about" className={isActive => isActive ? "active" : ""}>
  About
</Link>;
```

```tsx
<Link href="/about" asChild>
  <button>About</button>
</Link>;
```

### `<Redirect>`

Navigates immediately on mount.

```tsx
<Redirect href="/login" />;
```

```tsx
<Redirect href="/home" replace />;
```

### `<Router>`

Provides routing context. Optional — browser history is used by default.

```tsx
<Router>
  <App />
</Router>;
```

```tsx
<Router history={createHashHistory()}>
  <App />
</Router>;
```

#### Base Path

Prepend all routes with a base path.

```tsx
<Router base="/dashboard">
  <App />
</Router>;
```

## Hooks

### `useLocation`

Returns the current path and a navigate function.

```tsx
const { location, navigate } = useLocation();

navigate("/about");
navigate("/login", { replace: true });
```

### `useRoute`

Matches a pattern against the current path.

```tsx
const { matched, params } = useRoute("/users/:id");

if (matched) {
  console.log(params.id);
}
```

### `useParams`

Returns route parameters from the nearest `<Route>`.

```tsx
const { id } = useParams<"/users/:id">();
```

### `useSearch`

Returns the search string (without the leading `?`).

```tsx
// URL: /page?sort=name&page=2
const search = useSearch(); // "sort=name&page=2"
```

### `useSearchParams`

Returns `URLSearchParams` and a setter.

```tsx
const { params, setParams } = useSearchParams();

const sort = params.get("sort");

setParams(new URLSearchParams({ sort: "date" }));

// Functional update
setParams((prev) => {
  prev.set("page", "2");
  return prev;
});
```

### `useRouter`

Returns the current router context.

```tsx
const router = useRouter();
console.log(router.base); // "/"
```

## Pattern Matching

Match paths directly without hooks or components.

```tsx
import { matchPath, matchRoute } from "@w3cj/ruta";

const { matched, params } = matchPath("/users/:id", "/users/42");
// matched: true, params: { id: "42" }

const result = matchPath("/files/*", "/files/a/b/c");
// result.matched: true, result.params: { "*": "a/b/c" }

const match = matchRoute(/^\/post-(?<slug>\w+)$/, "/post-hello");
// match.matched: true, match.params: { slug: "hello" }
```

## Path Utilities

```tsx
import { absolutePath, relativePath, sanitizeSearch } from "@w3cj/ruta";

absolutePath("/dashboard", "/app"); // "/app/dashboard"
absolutePath("~/home", "/app"); // "/home" (~ bypasses base)

relativePath("/app", "/app/dashboard"); // "/dashboard"

sanitizeSearch("?foo=bar"); // "foo=bar"
```

## Manual Route Registration

You can use Switch and Route to create the route tree manually if needed, but you will not get type-safety.

```tsx
import { Link, Route, Switch, useParams } from "@w3cj/ruta";

const App = () => (
  <>
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
    </nav>

    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/users/:id" component={User} />
    </Switch>
  </>
);

const Home = () => <h1>Home</h1>;
const About = () => <h1>About</h1>;
const User = () => {
  const { id } = useParams<"/users/:id">();
  return (
    <h1>
      User
      {id}
    </h1>
  );
};
```
