import { describe, expect, it, vi } from "vitest";
import { createBrowserHistory, createHashHistory, createMemoryHistory } from "./history.js";

describe("createBrowserHistory", () => {
  it("returns current pathname", () => {
    const h = createBrowserHistory();
    expect(h.location()).toBe("/");
  });

  it("navigates with pushState", () => {
    const h = createBrowserHistory();
    h.navigate("/dashboard");
    expect(h.location()).toBe("/dashboard");
    h.navigate("/");
  });

  it("navigates with replaceState", () => {
    const h = createBrowserHistory();
    h.navigate("/replaced", { replace: true });
    expect(h.location()).toBe("/replaced");
    h.navigate("/");
  });

  it("preserves state", () => {
    const h = createBrowserHistory();
    h.navigate("/with-state", { state: { foo: 1 } });
    expect(history.state).toEqual({ foo: 1 });
    h.navigate("/");
  });

  it("notifies subscribers on navigate", () => {
    const h = createBrowserHistory();
    const cb = vi.fn();
    h.subscribe(cb);
    h.navigate("/test");
    expect(cb).toHaveBeenCalled();
    h.navigate("/");
  });

  it("notifies subscribers on popstate", () => {
    const h = createBrowserHistory();
    const cb = vi.fn();
    h.subscribe(cb);
    dispatchEvent(new PopStateEvent("popstate"));
    expect(cb).toHaveBeenCalled();
  });

  it("unsubscribes correctly", () => {
    const h = createBrowserHistory();
    const cb = vi.fn();
    const unsub = h.subscribe(cb);
    unsub();
    h.navigate("/ignored");
    expect(cb).not.toHaveBeenCalled();
    h.navigate("/");
  });

  it("createHref is identity", () => {
    const h = createBrowserHistory();
    expect(h.createHref("/about")).toBe("/about");
  });

  it("returns search string without ?", () => {
    const h = createBrowserHistory();
    expect(typeof h.search()).toBe("string");
  });
});

describe("createHashHistory", () => {
  it("navigates via hash", () => {
    const h = createHashHistory();
    h.navigate("/dashboard");
    expect(location.hash).toBe("#/dashboard");
  });

  it("navigates with replace", () => {
    const h = createHashHistory();
    h.navigate("/first");
    h.navigate("/second", { replace: true });
    expect(h.location()).toBe("/second");
  });

  it("preserves state", () => {
    const h = createHashHistory();
    const state = { from: "login" };
    h.navigate("/page", { state });
    expect(history.state).toEqual(state);
  });

  it("notifies subscribers on navigate", () => {
    const h = createHashHistory();
    const cb = vi.fn();
    h.subscribe(cb);
    h.navigate("/test");
    expect(cb).toHaveBeenCalled();
  });

  it("unsubscribes correctly", () => {
    const h = createHashHistory();
    const cb = vi.fn();
    const unsub = h.subscribe(cb);
    unsub();
    h.navigate("/new-entry");
    expect(cb).not.toHaveBeenCalled();
  });

  it("strips hash prefix from location", () => {
    const h = createHashHistory();
    h.navigate("#/page");
    expect(h.location()).toBe("/page");
    h.navigate("/other");
    expect(h.location()).toBe("/other");
  });

  it("handles query strings", () => {
    const h = createHashHistory();
    h.navigate("/page?foo=bar");
    expect(h.location()).toBe("/page");
  });

  it("createHref prefixes with #", () => {
    const h = createHashHistory();
    expect(h.createHref("/about")).toBe("#/about");
  });

  it("dispatches hashchange with old and new URL", () => {
    const h = createHashHistory();
    h.navigate("/old");
    const listener = vi.fn();
    addEventListener("hashchange", listener);
    h.navigate("/new");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        oldURL: expect.stringContaining("/old"),
        newURL: expect.stringContaining("/new"),
      }),
    );
    removeEventListener("hashchange", listener);
  });
});

describe("createMemoryHistory", () => {
  it("starts at / by default", () => {
    const h = createMemoryHistory();
    expect(h.location()).toBe("/");
  });

  it("records history when record is true", () => {
    const h = createMemoryHistory({ record: true });
    h.navigate("/a");
    h.navigate("/b");
    expect(h.entries).toEqual(["/", "/a", "/b"]);
  });

  it("replaces last entry with replace option", () => {
    const h = createMemoryHistory({ record: true });
    h.navigate("/a");
    h.navigate("/b", { replace: true });
    expect(h.entries).toEqual(["/", "/b"]);
  });

  it("entries is undefined when record is false", () => {
    const h = createMemoryHistory();
    expect(h.entries).toBeUndefined();
  });

  it("resets to initial state", () => {
    const h = createMemoryHistory({ path: "/start", record: true });
    h.navigate("/a");
    h.navigate("/b");
    h.reset!();
    expect(h.location()).toBe("/start");
    expect(h.entries).toEqual(["/start"]);
  });

  it("ignores navigation when static", () => {
    const h = createMemoryHistory({ record: true, static: true });
    h.navigate("/anywhere");
    expect(h.location()).toBe("/");
    expect(h.entries).toEqual(["/"]);
  });

  it("notifies subscribers on navigate", () => {
    const h = createMemoryHistory();
    const cb = vi.fn();
    h.subscribe(cb);
    h.navigate("/test");
    expect(cb).toHaveBeenCalled();
  });

  it("supports replace without record", () => {
    const h = createMemoryHistory({ path: "/start" });
    h.navigate("/replaced", { replace: true });
    expect(h.location()).toBe("/replaced");
  });

  it("handles path with query string", () => {
    const h = createMemoryHistory({ path: "/page?foo=bar", record: true });
    expect(h.location()).toBe("/page");
    expect(h.search()).toBe("foo=bar");
    expect(h.entries).toEqual(["/page?foo=bar"]);
  });

  it("handles searchPath option", () => {
    const h = createMemoryHistory({ path: "/page", searchPath: "q=1", record: true });
    expect(h.location()).toBe("/page");
    expect(h.search()).toBe("q=1");
    expect(h.entries).toEqual(["/page?q=1"]);
  });

  it("search returns empty string by default", () => {
    const h = createMemoryHistory();
    expect(h.search()).toBe("");
  });

  it("search hook returns current search string", () => {
    const h = createMemoryHistory();
    expect(h.search()).toBe("");
  });

  it("reset works even when static", () => {
    const h = createMemoryHistory({ path: "/home", record: true, static: true });
    h.navigate("/ignored");
    expect(h.location()).toBe("/home");
    h.reset!();
    expect(h.location()).toBe("/home");
    expect(h.entries).toEqual(["/home"]);
  });
});
