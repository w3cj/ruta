import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Router } from "../components/router.js";
import { useLocation } from "../hooks.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("useLocation", () => {
  it("returns current pathname", () => {
    let captured: string | undefined;
    const Test = () => {
      const [location] = useLocation();
      captured = location;
      return <div>{location}</div>;
    };
    render(<Test />, document.getElementById("root")!);
    expect(captured).toBe("/");
  });

  it("returns a [value, navigate] pair", () => {
    let result: unknown;
    const Test = () => {
      result = useLocation();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(Array.isArray(result)).toBe(true);
    const [location, nav] = result as [string, (...args: unknown[]) => void];
    expect(typeof location).toBe("string");
    expect(typeof nav).toBe("function");
  });

  it("navigate updates the location", () => {
    let navigate: ((...args: unknown[]) => void) | undefined;
    const Test = () => {
      const [, nav] = useLocation();
      navigate = nav;
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    navigate!("/foo");
    expect(window.location.pathname).toBe("/foo");
  });

  it("strips base path from location", () => {
    window.history.replaceState(null, "", "/app/dashboard");
    let captured: string | undefined;
    const Test = () => {
      const [location] = useLocation();
      captured = location;
      return <div />;
    };
    render(<Router base="/app"><Test /></Router>, document.getElementById("root")!);
    expect(captured).toBe("/dashboard");
  });

  it("returns / when URL contains only basepath", () => {
    window.history.replaceState(null, "", "/app");
    let captured: string | undefined;
    const Test = () => {
      const [location] = useLocation();
      captured = location;
      return <div />;
    };
    render(<Router base="/app"><Test /></Router>, document.getElementById("root")!);
    expect(captured).toBe("/");
  });

  it("returns ~/path for unmatched basepath", () => {
    window.history.replaceState(null, "", "/other/path");
    let captured: string | undefined;
    const Test = () => {
      const [location] = useLocation();
      captured = location;
      return <div />;
    };
    render(<Router base="/app"><Test /></Router>, document.getElementById("root")!);
    expect(captured).toBe("~/other/path");
  });

  it("navigate prepends basepath", () => {
    window.history.replaceState(null, "", "/app");
    let navigate: ((...args: unknown[]) => void) | undefined;
    const Test = () => {
      const [, nav] = useLocation();
      navigate = nav;
      return <div />;
    };
    render(<Router base="/app"><Test /></Router>, document.getElementById("root")!);
    navigate!("/dashboard");
    expect(window.location.pathname).toBe("/app/dashboard");
  });

  it("ignores / basepath", () => {
    window.history.replaceState(null, "", "/foo");
    let captured: string | undefined;
    const Test = () => {
      const [location] = useLocation();
      captured = location;
      return <div />;
    };
    render(<Router base="/"><Test /></Router>, document.getElementById("root")!);
    expect(captured).toBe("/foo");
  });
});
