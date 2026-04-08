import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Router } from "../components/router.js";
import { createMemoryHistory } from "../history.js";
import { useSearch } from "../hooks.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("useSearch", () => {
  it("returns query string without leading ?", () => {
    window.history.replaceState(null, "", "/page?foo=bar&baz=1");
    let captured: string | undefined;
    const Test = () => {
      captured = useSearch();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(captured).toBe("foo=bar&baz=1");
  });

  it("returns empty string when no query", () => {
    let captured: string | undefined;
    const Test = () => {
      captured = useSearch();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(captured).toBe("");
  });

  it("is safe against parameter injection", () => {
    window.history.replaceState(null, "", "/?search=foo%26parameter_injection%3Dbar");
    let captured: string | undefined;
    const Test = () => {
      captured = useSearch();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    const searchParams = new URLSearchParams(captured);
    const query = Object.fromEntries(searchParams.entries());
    expect(query).toEqual({ search: "foo&parameter_injection=bar" });
  });

  it("returns search from memory history", () => {
    const mem = createMemoryHistory({ path: "/", searchPath: "custom=yes" });
    let captured: string | undefined;
    const Test = () => {
      captured = useSearch();
      return <div />;
    };
    render(
      <Router history={mem}>
        <Test />
      </Router>,
      document.getElementById("root")!,
    );
    expect(captured).toBe("custom=yes");
  });

  it("unescapes search string", () => {
    window.history.replaceState(null, "", "/?hello%20world=%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82");
    let captured: string | undefined;
    const Test = () => {
      captured = useSearch();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(captured).toContain("hello world");
    expect(captured).toContain("привет");
  });
});
