import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-solid"],
	manifest: ({ manifestVersion }) => ({
		name: "d-Record",
		version: "2.0",
		description:
			"dアニメストアで見たアニメを記録することができます。自動もしくは手動で視聴したことをAnnictに送信して記録します。",
		permissions:
			manifestVersion === 3 ? ["storage"] : ["storage", "https://api.annict.com/graphql"],
	}),
	// vite: () => ({
	// 	build: {
	// 		minify: false,
	// 	},
	// }),
});
