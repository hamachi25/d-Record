import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-solid"],
	manifest: {
		name: "d-Record dev",
		permissions: ["storage"],
	},
});
