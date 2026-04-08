import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useRoute } from "../hooks.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("useRoute", () => {
  it("returns [true, params] when path matches", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/users/42");
    const Test = () => {
      result = useRoute("/users/:id");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([true, { id: "42" }]);
  });

  it("returns [false, {}] when path does not match", () => {
    let result: [boolean, Record<string, string>] | undefined;
    const Test = () => {
      result = useRoute("/users/:id");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([false, {}]);
  });

  it("supports trailing wildcards", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/app/dashboard/settings");
    const Test = () => {
      result = useRoute("/app/*");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([true, { "*": "dashboard/settings" }]);
  });

  it("supports multiple named params", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/posts/2024/hello-world");
    const Test = () => {
      result = useRoute("/posts/:year/:slug");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([true, { year: "2024", slug: "hello-world" }]);
  });

  it("matches root path", () => {
    let result: [boolean, Record<string, string>] | undefined;
    const Test = () => {
      result = useRoute("/");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([true, {}]);
  });

  it("does not match partial segments", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/users-list");
    const Test = () => {
      result = useRoute("/users");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([false, {}]);
  });

  it("supports wildcard as catch-all", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/any/deep/path");
    const Test = () => {
      result = useRoute("*");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result).toEqual([true, { "*": "any/deep/path" }]);
  });

  it("matches path with special characters in value", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/users/hello%20world");
    const Test = () => {
      result = useRoute("/users/:name");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result![0]).toBe(true);
    expect(result![1].name).toBeDefined();
  });

  it("ignores trailing slash", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/home/");
    const Test = () => {
      result = useRoute("/home");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result![0]).toBe(true);
  });

  it("supports wildcards in the middle of patterns", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/app/foo/settings");
    const Test = () => {
      result = useRoute("/app/*/settings");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result![0]).toBe(true);
  });

  it("supports optional segments", () => {
    let result1: [boolean, Record<string, string>] | undefined;
    let result2: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/hello");
    const Test1 = () => {
      result1 = useRoute("/:title?");
      return <div />;
    };
    render(<Test1 />, document.getElementById("root")!);
    expect(result1![0]).toBe(true);
    expect(result1![1].title).toBe("hello");

    document.getElementById("root")!.innerHTML = "";
    window.history.replaceState(null, "", "/");
    const Test2 = () => {
      result2 = useRoute("/:title?");
      return <div />;
    };
    render(<Test2 />, document.getElementById("root")!);
    expect(result2![0]).toBe(true);
  });

  it("supports other characters in segments", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/users/1-alex");
    const Test = () => {
      result = useRoute("/users/:id");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result![0]).toBe(true);
    expect(result![1].id).toBe("1-alex");
  });

  it("supports escaped slashes in params", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/users/hello%2Fworld");
    const Test = () => {
      result = useRoute("/users/:name");
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result![0]).toBe(true);
  });

  it("supports regex patterns", () => {
    let result: [boolean, Record<string, string>] | undefined;
    window.history.replaceState(null, "", "/foo");
    const Test = () => {
      result = useRoute(/^\/foo$/ as any);
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(result![0]).toBe(true);
  });
});
