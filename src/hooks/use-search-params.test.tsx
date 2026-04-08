import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Router } from "../components/router.js";
import { createMemoryHistory } from "../history.js";
import { useSearchParams } from "../hooks.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("useSearchParams", () => {
  it("returns browser search params", () => {
    window.history.replaceState(null, "", "/users?active=true");
    let params: URLSearchParams | undefined;
    const Test = () => {
      ({ params } = useSearchParams());
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(params!.get("active")).toBe("true");
  });

  it("can change browser search params", () => {
    window.history.replaceState(null, "", "/users?active=true");
    let setParams: ((v: URLSearchParams) => void) | undefined;
    const Test = () => {
      ({ setParams } = useSearchParams());
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    setParams!(new URLSearchParams("active=false"));
    expect(window.location.search).toBe("?active=false");
  });

  it("returns search params from memory history", () => {
    const mem = createMemoryHistory({ path: "/page", searchPath: "x=1" });
    let params: URLSearchParams | undefined;
    const Test = () => {
      ({ params } = useSearchParams());
      return <div />;
    };
    render(
      <Router history={mem}>
        <Test />
      </Router>,
      document.getElementById("root")!,
    );
    expect(params!.get("x")).toBe("1");
  });

  it("unescapes search string", () => {
    window.history.replaceState(null, "", "/page?name=%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D1%82");
    let params: URLSearchParams | undefined;
    const Test = () => {
      ({ params } = useSearchParams());
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(params!.get("name")).toBe("привет");
  });

  it("is safe against parameter injection", () => {
    window.history.replaceState(null, "", "/?search=foo%26injected%3Dbar");
    let params: URLSearchParams | undefined;
    const Test = () => {
      ({ params } = useSearchParams());
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(params!.get("search")).toBe("foo&injected=bar");
    expect(params!.get("injected")).toBeNull();
  });
});
