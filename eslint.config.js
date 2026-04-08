import antfu from "@antfu/eslint-config";
import preferArrowFunctions from "eslint-plugin-prefer-arrow-functions";

export default antfu({
  type: "lib",
  react: true,
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
    overrides: {
      "style/no-tabs": "off",
    },
  },
  markdown: {
    overrides: {
      "react-refresh/only-export-components": "off",
      "react/rules-of-hooks": "off",
    },
  },
}, {
  rules: {
    "ts/prefer-optional-chain": "off",
    "unicorn/prefer-ternary": "error",
    "antfu/top-level-function": "off",
    "ts/no-redeclare": "off",
    "ts/consistent-type-definitions": ["error", "type"],
    "antfu/no-top-level-await": ["off"],
    "node/prefer-global/process": ["off"],
    "node/no-process-env": ["error"],
    "perfectionist/sort-imports": [
      "error",
      {
        groups: [
          "type-import",
          ["type-parent", "type-sibling", "type-index", "type-internal"],
          "value-builtin",
          "value-external",
          "value-internal",
          ["value-parent", "value-sibling", "value-index"],
          "side-effect",
          "ts-equals-import",
          "unknown",
        ],
        newlinesBetween: "ignore",
        newlinesInside: "ignore",
        order: "asc",
        type: "natural",
      },
    ],
    "unicorn/filename-case": ["error", {
      case: "kebabCase",
      ignore: ["README.md"],
    }],
    // hono/jsx uses useContext, not React 19's use()
    "react/no-use-context": "off",
    // hono/jsx uses Context.Provider, not React 19's <Context>
    "react/no-context-provider": "off",
    // cloneElement is needed for Switch (match passing) and Link (asChild)
    "react/no-clone-element": "off",
  },
}, {
  files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
  rules: {
    // Test files need inline components to capture hook state
    "react/component-hook-factories": "off",
  },
}, {
  files: ["**/use-hash-location.ts", "**/memory-location.ts", "**/context.ts", "**/hooks.ts"],
  rules: {
    // These files define hook factories that call useSyncExternalStore at render time
    // but are stored in variables, not named use*
    "react/rules-of-hooks": "off",
  },
}, {
  files: ["**/*.md"],
  language: "markdown/gfm",
  rules: {
    "perfectionist/sort-imports": "off",
  },
}, preferArrowFunctions.configs.all);
