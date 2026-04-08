/* eslint-disable ts/no-empty-object-type -- {} is needed in type assertions for "no params" */
import type { ExtractParams, ParamsOf, ParamsProp, RoutePath, StrictRoutePath, TypedMatchResult } from "./route-types.js";
import { describe, expectTypeOf, it } from "vitest";

describe("extractParams", () => {
  it("returns empty object for static path", () => {
    expectTypeOf<ExtractParams<"/about">>().toEqualTypeOf<{}>();
  });

  it("returns empty object for root", () => {
    expectTypeOf<ExtractParams<"/">>().toEqualTypeOf<{}>();
  });

  it("extracts single param", () => {
    expectTypeOf<ExtractParams<"/users/:id">>().toEqualTypeOf<{ id: string }>();
  });

  it("extracts multiple params", () => {
    expectTypeOf<ExtractParams<"/posts/:year/:slug">>().toEqualTypeOf<{ year: string; slug: string }>();
  });

  it("extracts wildcard", () => {
    expectTypeOf<ExtractParams<"/files/*">>().toEqualTypeOf<{ "*": string }>();
  });

  it("extracts optional param", () => {
    expectTypeOf<ExtractParams<"/:title?">>().toEqualTypeOf<{ title?: string }>();
  });

  it("extracts param before wildcard", () => {
    expectTypeOf<ExtractParams<"/users/:id/*">>().toEqualTypeOf<{ id: string } & { "*": string }>();
  });

  it("extracts params in nested segments", () => {
    expectTypeOf<ExtractParams<"/orgs/:org/users/:id">>().toEqualTypeOf<{ org: string } & { id: string }>();
  });

  it("returns empty object for plain string type", () => {
    expectTypeOf<ExtractParams<string>>().toEqualTypeOf<{}>();
  });
});

describe("paramsOf", () => {
  it("is an alias for ExtractParams", () => {
    expectTypeOf<ParamsOf<"/users/:id">>().toEqualTypeOf<ExtractParams<"/users/:id">>();
  });
});

describe("paramsProp", () => {
  it("is never for static paths", () => {
    expectTypeOf<ParamsProp<"/about">>().toEqualTypeOf<{ params?: never }>();
  });

  it("requires params for parameterized paths", () => {
    expectTypeOf<ParamsProp<"/users/:id">>().toEqualTypeOf<{ params: { id: string } }>();
  });

  it("is never for plain string type", () => {
    expectTypeOf<ParamsProp<string>>().toEqualTypeOf<{ params?: never }>();
  });
});

describe("typedMatchResult", () => {
  it("includes typed params", () => {
    type Result = TypedMatchResult<"/users/:id">;
    expectTypeOf<Result>().toEqualTypeOf<{ matched: boolean; params: { id: string } }>();
  });
});

describe("routePath (without Register augmentation)", () => {
  it("is string when Register is empty", () => {
    // When no routes are registered, RoutePath should accept any string
    expectTypeOf<RoutePath>().toEqualTypeOf<string>();
  });

  it("strictRoutePath is string when Register is empty", () => {
    expectTypeOf<StrictRoutePath>().toEqualTypeOf<string>();
  });
});
