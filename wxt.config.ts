import { defineConfig } from "wxt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perBrowserManifest: Record<string, any> = {
	firefox: {
		browser_specific_settings: {
			gecko: {
				id: "{32acf05e-234c-4a49-98ca-47c15d23a51f}",
				strict_min_version: "115.0",
			},
		},
	},
};

export default defineConfig({
	modules: ["@wxt-dev/module-solid", "@wxt-dev/auto-icons"],
	manifest: ({ manifestVersion, browser }) => ({
		name: "d-Record",
		permissions:
			manifestVersion === 3
				? ["storage", "identity"]
				: ["storage", "identity", "https://api.annict.com/graphql"],
		...perBrowserManifest[browser],
	}),
	zip: {
		excludeSources: ["README.md"],
	},
	autoIcons: {
		enabled: true,
		grayscaleOnDevelopment: true,
	},
	// vite: () => ({
	// 	build: {
	// 		minify: false,
	// 	},
	// }),
});
