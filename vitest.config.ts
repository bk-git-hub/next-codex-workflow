import { readFileSync } from "node:fs";

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "raw-hbs-loader",
      enforce: "pre",
      load(id) {
        if (!id.endsWith(".hbs")) {
          return null;
        }

        return `export default ${JSON.stringify(readFileSync(id, "utf8"))};`;
      }
    }
  ],
  test: {
    environment: "node",
    testTimeout: 10000
  }
});
