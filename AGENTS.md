# AGENTS.md - Development Guidelines for AI Agents

## Project

Ruta - A tiny type-safe client-side router for hono/jsx

## Tech Stack

- Runtime: hono/jsx/dom (client-side JSX)
- Build: vite (library mode), typescript
- Test: vitest, happy-dom
- Package manager: pnpm
- Lint: eslint with @antfu/eslint-config

## TDD Workflow (MANDATORY)

All development MUST follow strict Red-Green-Refactor TDD:

### The Cycle

1. **RED** - Write exactly ONE failing test for the smallest next behavior
   - Run `pnpm test` to confirm it fails
   - The test must fail for the RIGHT reason (not a syntax error)
2. **GREEN** - Write the MINIMUM code to make that test pass
   - No extra features, no premature abstractions
   - Run `pnpm test` to confirm it passes
3. **REFACTOR** - Clean up code while keeping all tests green
   - Remove duplication, improve naming, simplify
   - Run `pnpm test` to confirm nothing broke
4. **REPEAT** - Move to the next behavior

### Rules

- NEVER write more than one test before making it pass
- NEVER write implementation code without a failing test demanding it
- NEVER skip the "run tests" step - always verify red before green
- Keep tests focused: one assertion per test when possible
- Test behavior, not implementation details
- Use descriptive test names: "matches static path /about"
- Run the linter (`pnpm lint`) before committing or moving on to the next task

### Running Tests

- `pnpm test` - run all tests once
- `pnpm test -- src/matcher.test.ts` - run specific test file
- `pnpm test -- -t "matches static"` - run tests matching name pattern

### File Conventions

- Source: `src/` with kebab-case filenames
- Unit tests: co-located next to source files as `*.test.ts` (e.g. `src/matcher.test.ts`)
- Integration/e2e tests only: `test/` directory
- Components use `.tsx` extension, pure logic uses `.ts`

### Import Conventions

- Types: `import type { X } from "..."` (separate from value imports)
- hono/jsx hooks: `import { useState, useEffect } from "hono/jsx"`
- hono/jsx/dom rendering: `import { render } from "hono/jsx/dom"`
- Use `type` keyword for type definitions (not `interface`)
- **Always use `.js` extensions on relative imports** (e.g. `import { foo } from "./bar.js"`)
  - TypeScript's `rewriteRelativeImportExtensions` resolves `.js` to `.ts`/`.tsx` at compile time
