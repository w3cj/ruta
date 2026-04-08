import type { Plugin } from "vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const detectAccidentalBundles = (): Plugin => ({
  name: "detect-accidental-bundles",
  generateBundle(_options, bundle) {
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (chunk.type !== "chunk")
        continue;
      for (const moduleId of Object.keys(chunk.modules)) {
        if (moduleId.includes("node_modules")) {
          this.warn(
            `Bundled dependency detected in ${fileName}: ${moduleId}. `
            + `Add it to rollupOptions.external.`,
          );
        }
      }
    }
  },
});

export default defineConfig({
  plugins: [
    dts({
      include: ["src"],
      exclude: ["**/*.test.*", "**/*.bench.*"],
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace("/dist/src/", "/dist/"),
        content,
      }),
    }),
    detectAccidentalBundles(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [/^hono/],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
});
