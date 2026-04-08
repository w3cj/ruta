import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { createHashHistory, createMemoryHistory } from "../history.js";
import { useLocation, useRouter } from "../hooks.js";
import { Router } from "./router.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("router", () => {
  it("strips base path from useLocation", () => {
    window.history.replaceState(null, "", "/app/dashboard");
    let captured: string | undefined;
    const Test = () => {
      const { location } = useLocation();
      captured = location;
      return <div />;
    };
    render(
      <Router base="/app">
        <Test />
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toBe("/dashboard");
  });

  it("has empty base by default", () => {
    let base: string | undefined;
    const Test = () => {
      base = useRouter().base;
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(base).toBe("");
  });

  it("nested routers concatenate bases", () => {
    let base: string | undefined;
    const Test = () => {
      base = useRouter().base;
      return <div />;
    };
    render(
      <Router base="/baz">
        <Router base="/foo">
          <Router base="/bar">
            <Test />
          </Router>
        </Router>
      </Router>,
      document.getElementById("root")!,
    );
    expect(base).toBe("/baz/foo/bar");
  });
});

describe("router stability", () => {
  it("shares one router instance between components", () => {
    let router1: unknown;
    let router2: unknown;
    const A = () => {
      router1 = useRouter();
      return <div />;
    };
    const B = () => {
      router2 = useRouter();
      return <div />;
    };
    render(
      <Router base="/app">
        <A />
        <B />
      </Router>,
      document.getElementById("root")!,
    );
    expect(router1).toBe(router2);
  });

  it("produces equivalent router across re-renders with same props", () => {
    let router1: any;
    let router2: any;
    const Test = () => {
      const r = useRouter();
      if (!router1)
        router1 = r;
      else router2 = r;
      return <div />;
    };
    const root = document.getElementById("root")!;
    render(
      <Router base="/app">
        <Test />
      </Router>,
      root,
    );
    render(
      <Router base="/app">
        <Test />
      </Router>,
      root,
    );
    if (router2) {
      expect(router2.base).toBe(router1.base);
      expect(router2.history).toBe(router1.history);
    }
  });
});

describe("router history prop", () => {
  it("prevents inheritance from parent router", () => {
    const mem = createMemoryHistory({ path: "/mem" });
    let captured: string | undefined;
    const Test = () => {
      const { location: loc } = useLocation();
      captured = loc;
      return <div />;
    };
    render(
      <Router base="/parent">
        <Router history={mem}>
          <Test />
        </Router>
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toBe("/mem");
  });

  it("uses hash history createHref", () => {
    const hash = createHashHistory();
    let captured: string | undefined;
    const Test = () => {
      captured = useRouter().history.createHref("/about");
      return <div />;
    };
    render(
      <Router history={hash}>
        <Test />
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toBe("#/about");
  });
});
