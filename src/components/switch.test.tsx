import { render } from "hono/jsx/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { Route } from "./route.js";
import { Switch } from "./switch.js";

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  document.body.innerHTML = "<div id=\"root\"></div>";
});

describe("switch", () => {
  it("renders only the first matching route", () => {
    window.history.replaceState(null, "", "/about");
    render(
      <Switch>
        <Route path="/about"><p>First</p></Route>
        <Route path="/about"><p>Second</p></Route>
        <Route path="/other"><p>Other</p></Route>
      </Switch>,
      document.getElementById("root")!,
    );
    const html = document.getElementById("root")!.innerHTML;
    expect(html).toContain("First");
    expect(html).not.toContain("Second");
    expect(html).not.toContain("Other");
  });

  it("renders nothing when no routes match", () => {
    render(
      <Switch>
        <Route path="/about"><p>About</p></Route>
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).not.toContain("About");
  });

  it("works when null is provided", () => {
    window.history.replaceState(null, "", "/users/12");
    render(
      <Switch>{null}</Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toBe("");
  });

  it("ignores falsy children", () => {
    window.history.replaceState(null, "", "/users");
    render(
      <Switch>

        {false}
        {null}
        {undefined}
        <Route path="/users">route</Route>
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("route");
  });

  it("uses route without path as fallback", () => {
    window.history.replaceState(null, "", "/unknown");
    render(
      <Switch>
        <Route path="/users"><p>Users</p></Route>
        <Route><p>Fallback</p></Route>
      </Switch>,
      document.getElementById("root")!,
    );
    const html = document.getElementById("root")!.innerHTML;
    expect(html).toContain("Fallback");
    expect(html).not.toContain("Users");
  });

  it("handles array children from map", () => {
    window.history.replaceState(null, "", "/item-2");
    render(
      <Switch>
        {[1, 2, 3].map(i => (
          <Route key={i} path={`/item-${i}`}><p>{`Item ${i}`}</p></Route>
        ))}
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("Item 2");
  });

  it("allows location prop to override current path", () => {
    render(
      <Switch location="/users">
        <Route path="/users">route</Route>
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toBe("route");
  });

  it("ignores mixed children", () => {
    window.history.replaceState(null, "", "/about");
    render(
      <Switch>
        some text
        <div>not a route</div>
        <Route path="/about"><p>About</p></Route>
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toContain("About");
  });

  it("supports catch-all routes with wildcard segments", () => {
    window.history.replaceState(null, "", "/anything/deep/path");
    render(
      <Switch>
        <Route path="/specific"><p>Specific</p></Route>
        <Route path="/*"><p>Catch-all</p></Route>
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toContain("Catch-all");
  });

  it("handles fragments as children", () => {
    window.history.replaceState(null, "", "/b");
    render(
      <Switch>
        <>
          <Route path="/a"><p>A</p></Route>
          <Route path="/b"><p>B</p></Route>
        </>
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.innerHTML).toContain("B");
  });

  it("matches regular components with path prop", () => {
    window.history.replaceState(null, "", "/custom");
    const Custom = ({ match }: { match?: any; path?: string }) => (
      <p>
        Custom:
        {match ? "matched" : "no"}
      </p>
    );
    render(
      <Switch>
        <Route path="/other"><p>Other</p></Route>
        <Custom path="/custom" />
      </Switch>,
      document.getElementById("root")!,
    );
    expect(document.getElementById("root")!.textContent).toContain("Custom");
  });
});
