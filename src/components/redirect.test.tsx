import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Redirect } from "./redirect.js";
import { Router } from "./router.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("redirect", () => {
  it("navigates to href on mount", () => {
    render(<Redirect href="/login" />, document.getElementById("root")!);
    expect(window.location.pathname).toBe("/login");
  });

  it("renders nothing", () => {
    render(<Redirect to="/users" />, document.getElementById("root")!);
    expect(document.getElementById("root")!.childNodes.length).toBe(0);
  });

  it("supports to prop as alias", () => {
    render(<Redirect to="/users" />, document.getElementById("root")!);
    expect(window.location.pathname).toBe("/users");
  });

  it("supports replace navigation", () => {
    const lengthBefore = window.history.length;
    render(<Redirect to="/users" replace />, document.getElementById("root")!);
    expect(window.location.pathname).toBe("/users");
    expect(window.history.length).toBe(lengthBefore);
  });

  it("supports base routers with relative path", () => {
    render(
      <Router base="/app">
        <Redirect href="/login" />
      </Router>,
      document.getElementById("root")!,
    );
    expect(window.location.pathname).toBe("/app/login");
  });

  it("supports absolute path with ~ prefix", () => {
    render(
      <Router base="/app">
        <Redirect href="~/home" />
      </Router>,
      document.getElementById("root")!,
    );
    expect(window.location.pathname).toBe("/home");
  });

  it("supports history state", () => {
    const testState = { from: "redirect" };
    render(<Redirect to="/target" state={testState} />, document.getElementById("root")!);
    expect(window.location.pathname).toBe("/target");
    expect(window.history.state).toEqual(testState);
  });
});
