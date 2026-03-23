import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    main: "src/cli/main.ts"
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
