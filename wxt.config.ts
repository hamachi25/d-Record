import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-solid"],
	manifest: ({ manifestVersion }) => ({
		name: "d-Record dev",
		content_scripts: [
			{
				matches: [
					"https://animestore.docomo.ne.jp/animestore/ci_pc*",
					"https://animestore.docomo.ne.jp/animestore/sc_d_pc*",
				],
				css: ["style.css"],
			},
		],
		permissions: manifestVersion === 3 ? ["storage"] : ["storage", "*://*/*"],
	}),
	// vite: () => ({
	// 	build: {
	// 		minify: false,
	// 	},
	// }),
});
