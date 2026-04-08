import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocation } from "../hooks.js";
import { Route } from "./route.js";
import { Router } from "./router.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("route", () => {
  it("renders children when path matches", () => {
    window.history.replaceState(null, "", "/about");
    render(<Route path="/about"><p>About</p></Route>, document.getElementById("root")!);
    expect(document.getElementById("root")!.innerHTML).toContain("About");
  });

  it("renders nothing when path does not match", () => {
    render(<Route path="/about"><p>About</p></Route>, document.getElementById("root")!);
    expect(document.getElementById("root")!.innerHTML).not.toContain("About");
  });

  it("works with render props", () => {
    window.history.replaceState(null, "", "/foo");
    render(
      <Route path="/foo">{() => <h1>Hello!</h1>}</Route>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toContain("Hello!");
  });

  it("passes params to render function", () => {
    window.history.replaceState(null, "", "/users/alex");
    render(
      <Route path="/users/:name">{params => <h1>{params.name}</h1>}</Route>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("alex");
  });

  it("supports component prop", () => {
    window.history.replaceState(null, "", "/foo");
    const Users = () => <h2>All users</h2>;
    render(
      <Route path="/foo" component={Users} />,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("All users");
  });

  it("supports base routers with relative path", () => {
    window.history.replaceState(null, "", "/app/nested");
    render(
      <Router base="/app">
        <Route path="/nested"><h1>Nested</h1></Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toContain("Nested");
  });

  it("always renders its content when path is empty", () => {
    window.history.replaceState(null, "", "/any/path");
    render(<Route><p>Catch all</p></Route>, document.getElementById("root")!);
    expect(document.getElementById("root")!.innerHTML).toContain("Catch all");
  });

  it("supports regex path", () => {
    window.history.replaceState(null, "", "/test");
    render(
      <Route path={/^\/test$/ as any}><p>Regex match</p></Route>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toContain("Regex match");
  });

  it("supports regex path with named groups", () => {
    window.history.replaceState(null, "", "/users/42");
    render(
      <Route path={/^\/users\/(?<id>\d+)$/ as any}>
        {(params: any) => <p>{params.id}</p>}
      </Route>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("42");
  });

  it("rejects non-matching regex path", () => {
    window.history.replaceState(null, "", "/other");
    render(
      <Route path={/^\/test$/ as any}><p>No match</p></Route>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).not.toContain("No match");
  });
});

describe("route with nest prop", () => {
  it("matches the pattern loosely", () => {
    window.history.replaceState(null, "", "/app/dashboard");
    render(
      <Route path="/app" nest>
        <p>Nested content</p>
      </Route>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("Nested content");
  });

  it("sets base to matched segment for nested routes", () => {
    window.history.replaceState(null, "", "/app/dashboard");
    let innerLocation: string | undefined;
    const Inner = () => {
      const { location: loc } = useLocation();
      innerLocation = loc;
      return <div />;
    };
    render(
      <Route path="/app" nest>
        <Inner />
      </Route>,
      document.getElementById("root")!,
    );
    expect(innerLocation).toBe("/dashboard");
  });
});
