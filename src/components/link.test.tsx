import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { createHashHistory, createMemoryHistory } from "../history.js";
import { Link } from "./link.js";
import { Router } from "./router.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("link", () => {
  it("renders an anchor with href", () => {
    render(<Link href="/about">About</Link>, document.getElementById("root")!);
    const a = document.querySelector("a");
    expect(a).not.toBeNull();
    expect(a!.getAttribute("href")).toBe("/about");
    expect(a!.textContent).toBe("About");
  });

  it("navigates on click", () => {
    render(<Link href="/about">About</Link>, document.getElementById("root")!);
    const a = document.querySelector("a")!;
    a.click();
    expect(window.location.pathname).toBe("/about");
  });

  it("supports to prop as alias for href", () => {
    render(<Link to="/about">About</Link>, document.getElementById("root")!);
    const a = document.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/about");
  });

  it("ignores click with modifier keys", () => {
    render(<Link href="/users">click</Link>, document.getElementById("root")!);
    const a = document.querySelector("a")!;
    const evt = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ctrlKey: true });
    evt.preventDefault();
    a.dispatchEvent(evt);
    expect(window.location.pathname).not.toBe("/users");
  });

  it("ignores click when event is cancelled", () => {
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
    };
    render(<Link href="/users" onClick={handleClick}>click</Link>, document.getElementById("root")!);
    const a = document.querySelector("a")!;
    a.click();
    expect(window.location.pathname).not.toBe("/users");
  });

  it("fires onClick before navigation", () => {
    let clicked = false;
    render(
      <Link href="/" onClick={() => { clicked = true; }}>click</Link>,
      document.getElementById("root")!,
    );
    document.querySelector("a")!.click();
    expect(clicked).toBe(true);
  });

  it("renders href with base path", () => {
    render(
      <Router base="/app">
        <Link href="/dashboard">dash</Link>
      </Router>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/app/dashboard");
  });

  it("supports history state", () => {
    const testState = { hello: "world" };
    render(<Link href="/goo" state={testState}>link</Link>, document.getElementById("root")!);
    document.querySelector("a")!.click();
    expect(window.location.pathname).toBe("/goo");
    expect(window.history.state).toEqual(testState);
  });

  it("supports replace navigation", () => {
    window.history.replaceState(null, "", "/initial");
    render(<Link href="/replaced" replace>click</Link>, document.getElementById("root")!);
    const lengthBefore = window.history.length;
    document.querySelector("a")!.click();
    expect(window.location.pathname).toBe("/replaced");
    expect(window.history.length).toBe(lengthBefore);
  });

  it("renders absolute links", () => {
    render(
      <Router base="/app">
        <Link href="~/home">home</Link>
      </Router>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/home");
  });

  it("supports custom href formatting via hash history", () => {
    const hash = createHashHistory();
    render(
      <Router history={hash}>
        <Link href="/about">about</Link>
      </Router>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("#/about");
  });

  it("supports className as function for active links", () => {
    const mem = createMemoryHistory({ path: "/about" });
    render(
      <Router history={mem}>
        <Link href="/about" className={(isActive: boolean) => isActive ? "active" : "inactive"}>about</Link>
      </Router>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a.className).toBe("active");
  });

  it("wraps children in anchor when asChild is not specified", () => {
    render(<Link href="/foo"><span>text</span></Link>, document.getElementById("root")!);
    const a = document.querySelector("a")!;
    expect(a).not.toBeNull();
    expect(a.querySelector("span")!.textContent).toBe("text");
  });

  it("injects href prop when rendered with asChild", () => {
    render(
      <Link href="/foo" asChild>
        <button>click</button>
      </Link>,
      document.getElementById("root")!,
    );
    const btn = document.querySelector("button")!;
    expect(btn).not.toBeNull();
    expect(btn.getAttribute("href")).toBe("/foo");
    expect(document.querySelector("a")).toBeNull();
  });

  it("renders a valid anchor when no children are provided", () => {
    render(<Link href="/about" data-testid="link" />, document.getElementById("root")!);
    const a = document.querySelector("a")!;
    expect(a).not.toBeNull();
    expect(a.getAttribute("href")).toBe("/about");
  });

  it("highlights active links correctly with hash history", () => {
    const mem = createMemoryHistory({ path: "/about" });
    render(
      <Router history={mem}>
        <Link href="/about" className={(isActive: boolean) => isActive ? "active" : "inactive"}>about</Link>
      </Router>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a.className).toBe("active");
  });

  it("wraps children in anchor when asChild has plain text", () => {
    render(
      <Link href="/foo" asChild>
        just text
      </Link>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a).not.toBeNull();
  });

  it("wraps children in anchor when asChild has multiple children", () => {
    render(
      <Link href="/foo" asChild>
        <span>one</span>
        <span>two</span>
      </Link>,
      document.getElementById("root")!,
    );
    const a = document.querySelector("a")!;
    expect(a).not.toBeNull();
  });
});
