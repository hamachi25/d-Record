import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: "src/main.ts",
            },
            output: {
                entryFileNames: "main.js",
            },
        },
        // minify: false,
    },
});
