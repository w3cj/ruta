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

const NAV_EVENT = "ruta:nav";

const ensureHistoryPatched = (): void => {
  if ((window as any)[Symbol.for(NAV_EVENT)])
    return;
  (window as any)[Symbol.for(NAV_EVENT)] = true;

  const wrap = (method: "pushState" | "replaceState"): void => {
    const orig = history[method].bind(history);
    history[method] = (state: any, title: string, url?: string | URL | null) => {
      orig(state, title, url);
      dispatchEvent(new Event(NAV_EVENT));
    };
  };
  wrap("pushState");
  wrap("replaceState");
};

export const createBrowserHistory = (): History => ({
  location: () => location.pathname,
  search: () => location.search.startsWith("?") ? location.search.substring(1) : location.search,
  navigate: (to, opts) => {
    ensureHistoryPatched();
    history[opts?.replace ? "replaceState" : "pushState"](opts?.state ?? null, "", to);
  },
  subscribe: (cb) => {
    ensureHistoryPatched();
    addEventListener(NAV_EVENT, cb);
    addEventListener("popstate", cb);
    return () => {
      removeEventListener(NAV_EVENT, cb);
      removeEventListener("popstate", cb);
    };
  },
  createHref: href => href,
});

// --- Active history (module-level singleton) ---

let active: History | undefined;

export const getActiveHistory = (): History => {
  if (!active)
    active = createBrowserHistory();
  return active;
};

export const setActiveHistory = (h: History): void => {
  active = h;
};

// --- Hash history ---

const HASH_PREFIX = /^#?\/?/;

export const createHashHistory = (): History => {
  const subscribers = new Set<() => void>();
  const notify = (): void => subscribers.forEach(fn => fn());

  return {
    location: () => `/${location.hash.replace(HASH_PREFIX, "")}`,
    search: () => location.search.startsWith("?") ? location.search.substring(1) : location.search,
    navigate: (to, opts) => {
      const { state = null, replace = false } = opts ?? {};
      const oldURL = location.href;
      const stripped = to.replace(HASH_PREFIX, "");
      const [hashPart, searchPart] = stripped.split("?");
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
      subscribers.add(cb);
      if (subscribers.size === 1)
        addEventListener("hashchange", notify);
      return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0)
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

export const createMemoryHistory = (opts: MemoryHistoryOptions = {}): MemoryHistory => {
  const buildInitial = (): string => {
    let url = opts.path ?? "/";
    if (opts.searchPath)
      url += (url.includes("?") ? "&" : "?") + opts.searchPath;
    return url;
  };

  const initial = buildInitial();
  const allEntries: string[] = [initial];
  const watchers = new Set<() => void>();
  const frozen = opts.static ?? false;

  const split = (url: string): [string, string] => {
    const qi = url.indexOf("?");
    return qi < 0 ? [url, ""] : [url.substring(0, qi), url.substring(qi + 1)];
  };

  let [pathname, searchStr] = split(initial);
  const broadcast = (): void => watchers.forEach(fn => fn());

  const set = (to: string, navOpts?: NavigateOptions): void => {
    if (opts.record) {
      if (navOpts?.replace)
        allEntries.splice(-1, 1, to);
      else
        allEntries.push(to);
    }
    [pathname, searchStr] = split(to);
    broadcast();
  };

  const go = (to: string, navOpts?: NavigateOptions): void => {
    if (!frozen)
      set(to, navOpts);
  };

  return {
    location: () => pathname,
    search: () => searchStr,
    navigate: go,
    subscribe: (cb) => {
      watchers.add(cb);
      return () => {
        watchers.delete(cb);
      };
    },
    createHref: href => href,
    entries: opts.record ? allEntries : undefined,
    reset: opts.record
      ? () => {
          allEntries.splice(0, allEntries.length);
          set(initial);
        }
      : undefined,
  };
};
