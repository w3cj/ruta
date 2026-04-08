import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Route } from "../components/route.js";
import { Router } from "../components/router.js";
import { createMemoryHistory } from "../history.js";
import { ParamsContext, useParams } from "../hooks.js";

beforeEach(() => {
  document.body.innerHTML = "<div id=\"root\"></div>";
  window.history.replaceState(null, "", "/");
});

describe("useParams", () => {
  it("returns params from ParamsContext", () => {
    let captured: Record<string, string | undefined> | undefined;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <ParamsContext.Provider value={{ id: "42" }}>
        <Test />
      </ParamsContext.Provider>,
      document.getElementById("root")!,
    );
    expect(captured).toEqual({ id: "42" });
  });

  it("returns empty object when used outside Route", () => {
    let captured: Record<string, string | undefined> | undefined;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(captured).toEqual({});
  });

  it("contains params from closest parent Route", () => {
    const mem = createMemoryHistory({ path: "/users/42" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route path="/users/:id">
          <Test />
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toEqual({ id: "42" });
  });

  it("returns empty object when no params exist", () => {
    const mem = createMemoryHistory({ path: "/about" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route path="/about">
          <Test />
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toEqual({});
  });

  it("extracts nested route parameters", () => {
    const mem = createMemoryHistory({ path: "/app/users/42" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route path="/app" nest>
          <Route path="/users/:id">
            <Test />
          </Route>
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured!.id).toBe("42");
  });

  it("inherits parameters from parent nested routes", () => {
    const mem = createMemoryHistory({ path: "/orgs/acme/users/42" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route path="/orgs/:org" nest>
          <Route path="/users/:id">
            <Test />
          </Route>
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toEqual({ org: "acme", id: "42" });
  });

  it("contains wildcard parameter inside pathless Route", () => {
    const mem = createMemoryHistory({ path: "/anything/here" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route>
          <Test />
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured["*"]).toBeDefined();
  });

  it("extracts params from routes with multiple segments", () => {
    const mem = createMemoryHistory({ path: "/posts/2024/hello" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route path="/posts/:year/:slug">
          <Test />
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toEqual({ year: "2024", slug: "hello" });
  });

  it("returns empty params when route has no path params", () => {
    const mem = createMemoryHistory({ path: "/about" });
    let captured: any;
    const Test = () => {
      captured = useParams();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Route path="/about">
          <Test />
        </Route>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toEqual({});
  });
});
