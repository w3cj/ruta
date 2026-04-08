import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useRoute } from "../hooks.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("useRoute", () => {
  it("returns { matched: true, params } when path matches", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/users/42");
    const Test = () => {
      result = useRoute("/users/:id");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: true, params: { id: "42" } });
  });

  it("returns { matched: false, params: {} } when path does not match", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    const Test = () => {
      result = useRoute("/users/:id");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: false, params: {} });
  });

  it("supports trailing wildcards", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/app/dashboard/settings");
    const Test = () => {
      result = useRoute("/app/*");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: true, params: { "*": "dashboard/settings" } });
  });

  it("supports multiple named params", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/posts/2024/hello-world");
    const Test = () => {
      result = useRoute("/posts/:year/:slug");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: true, params: { year: "2024", slug: "hello-world" } });
  });

  it("matches root path", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    const Test = () => {
      result = useRoute("/");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: true, params: {} });
  });

  it("does not match partial segments", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/users-list");
    const Test = () => {
      result = useRoute("/users");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: false, params: {} });
  });

  it("supports wildcard as catch-all", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/any/deep/path");
    const Test = () => {
      result = useRoute("*");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual({ matched: true, params: { "*": "any/deep/path" } });
  });

  it("matches path with special characters in value", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/users/hello%20world");
    const Test = () => {
      result = useRoute("/users/:name");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result!.matched).toBe(true);
    expect(result!.params.name).toBeDefined();
  });

  it("ignores trailing slash", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/home/");
    const Test = () => {
      result = useRoute("/home");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result!.matched).toBe(true);
  });

  it("supports wildcards in the middle of patterns", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/app/foo/settings");
    const Test = () => {
      result = useRoute("/app/*/settings");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result!.matched).toBe(true);
  });

  it("supports optional segments", () => {
    let result1: { matched: boolean; params: Record<string, string> } | undefined;
    let result2: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/hello");
    const Test1 = () => {
      result1 = useRoute("/:title?");
      return <div />;
    };
    render(<Test1 />, document.getElementById("root")!);
    expect(result1!.matched).toBe(true);
    expect(result1!.params.title).toBe("hello");

    document.getElementById("root")!.innerHTML = "";
    window.history.replaceState(null, "", "/");
    const Test2 = () => {
      result2 = useRoute("/:title?");
      return <div />;
    };
    render(<Test2 />, document.getElementById("root")!);
    expect(result2!.matched).toBe(true);
  });

  it("supports other characters in segments", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/users/1-alex");
    const Test = () => {
      result = useRoute("/users/:id");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result!.matched).toBe(true);
    expect(result!.params.id).toBe("1-alex");
  });

  it("supports escaped slashes in params", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/users/hello%2Fworld");
    const Test = () => {
      result = useRoute("/users/:name");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result!.matched).toBe(true);
  });

  it("supports regex patterns", () => {
    let result: { matched: boolean; params: Record<string, string> } | undefined;
    window.history.replaceState(null, "", "/foo");
    const Test = () => {
      result = useRoute(/^\/foo$/ as any);
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result!.matched).toBe(true);
  });
});
