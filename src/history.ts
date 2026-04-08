export type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
  transition?: boolean;
};

export type History = {
  location: () => string;
  search: () => string;
  navigate: (to: string, options?: NavigateOptions) => void;
  subscribe: (listener: () => void) => () => void;
  createHref: (href: string) => string;
};

export type MemoryHistory = History & {
  entries?: string[];
  reset?: () => void;
};

// --- Browser history ---

const NAV = "ruta:nav";
const SYM = Symbol.for(NAV);

const ensureHistoryPatched = (): void => {
  if ((window as any)[SYM])
    return;
  (window as any)[SYM] = true;
  for (const m of ["pushState", "replaceState"] as const) {
    const orig = history[m].bind(history);
    history[m] = (state: any, title: string, url?: string | URL | null) => {
      orig(state, title, url);
      dispatchEvent(new Event(NAV));
    };
  }
};

const stripQ = (s: string): string => s.startsWith("?") ? s.slice(1) : s;

export const createBrowserHistory = (): History => ({
  location: () => location.pathname,
  search: () => stripQ(location.search),
  navigate: (to, opts) => {
    ensureHistoryPatched();
    history[opts?.replace ? "replaceState" : "pushState"](opts?.state ?? null, "", to);
  },
  subscribe: (cb) => {
    ensureHistoryPatched();
    addEventListener(NAV, cb);
    addEventListener("popstate", cb);
    return () => {
      removeEventListener(NAV, cb);
      removeEventListener("popstate", cb);
    };
  },
  createHref: href => href,
});

// --- Active history (module-level singleton) ---

let active: History | undefined;

export const getActiveHistory = (): History => active ??= createBrowserHistory();

export const setActiveHistory = (h: History): void => {
  active = h;
};

// --- Hash history ---

export const createHashHistory = (): History => {
  const subs = new Set<() => void>();
  const notify = (): void => subs.forEach(fn => fn());
  const HP = /^#?\/?/;

  return {
    location: () => `/${location.hash.replace(HP, "")}`,
    search: () => stripQ(location.search),
    navigate: (to, opts) => {
      const { state = null, replace = false } = opts ?? {};
      const oldURL = location.href;
      const [hashPart, searchPart] = to.replace(HP, "").split("?");
      const url = new URL(location.href);
      url.hash = `/${hashPart}`;
      if (searchPart)
        url.search = searchPart;
      history[replace ? "replaceState" : "pushState"](state, "", url.href);
      dispatchEvent(
        typeof HashChangeEvent !== "undefined"
          ? new HashChangeEvent("hashchange", { oldURL, newURL: url.href })
          : new Event("hashchange"),
      );
    },
    subscribe: (cb) => {
      subs.add(cb);
      if (subs.size === 1)
        addEventListener("hashchange", notify);
      return () => {
        subs.delete(cb);
        if (subs.size === 0)
          removeEventListener("hashchange", notify);
      };
    },
    createHref: href => `#${href}`,
  };
};

// --- Memory history ---

export type MemoryHistoryOptions = {
  path?: string;
  searchPath?: string;
  static?: boolean;
  record?: boolean;
};

const split = (url: string): [string, string] => {
  const qi = url.indexOf("?");
  return qi < 0 ? [url, ""] : [url.slice(0, qi), url.slice(qi + 1)];
};

export const createMemoryHistory = (opts: MemoryHistoryOptions = {}): MemoryHistory => {
  let initial = opts.path ?? "/";
  if (opts.searchPath)
    initial += (initial.includes("?") ? "&" : "?") + opts.searchPath;

  const entries: string[] = [initial];
  const watchers = new Set<() => void>();

  let [pathname, searchStr] = split(initial);

  const set = (to: string, navOpts?: NavigateOptions): void => {
    if (opts.record) {
      if (navOpts?.replace)
        entries.splice(-1, 1, to);
      else
        entries.push(to);
    }
    [pathname, searchStr] = split(to);
    watchers.forEach(fn => fn());
  };

  return {
    location: () => pathname,
    search: () => searchStr,
    navigate: (to, navOpts) => {
      if (!opts.static)
        set(to, navOpts);
    },
    subscribe: (cb) => {
      watchers.add(cb);
      return () => {
        watchers.delete(cb);
      };
    },
    createHref: href => href,
    entries: opts.record ? entries : undefined,
    reset: opts.record
      ? () => {
          entries.splice(0, entries.length);
          set(initial);
        }
      : undefined,
  };
};
