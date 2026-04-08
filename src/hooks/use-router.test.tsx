import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { useRouter } from "../hooks.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("useRouter", () => {
  it("returns default router context", () => {
    let base: string | undefined;
    const Test = () => {
      const router = useRouter();
      base = router.base;
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(base).toBe("");
  });

  it("returns router with expected shape", () => {
    let router: any;
    const Test = () => {
      router = useRouter();
      return <div />;
    };
    render(<Test />, document.getElementById("root")!);
    expect(typeof router.base).toBe("string");
    expect(typeof router.history.location).toBe("function");
    expect(typeof router.history.navigate).toBe("function");
    expect(typeof router.history.subscribe).toBe("function");
    expect(typeof router.history.createHref).toBe("function");
  });
});
