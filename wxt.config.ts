import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-solid"],
	manifest: ({ manifestVersion }) => ({
		name: "d-Record",
		permissions:
			manifestVersion === 3 ? ["storage"] : ["storage", "https://api.annict.com/graphql"],
	}),
	// vite: () => ({
	// 	build: {
	// 		minify: false,
	// 	},
	// }),
});
