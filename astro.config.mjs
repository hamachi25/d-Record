// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
    site: "https://hamachi25.github.io",
    base: "/d-Record",
    integrations: [
        starlight({
            title: "d-Record",
            locales: {
                root: {
                    label: "日本語",
                    lang: "ja",
                },
            },
            favicon: "./public/favicon.svg",
            logo: {
                light: "./src/assets/light-title.svg",
                dark: "./src/assets/dark-title.svg",
                replacesTitle: true,
            },
            social: {
                github: "https://github.com/hamachi25/d-Record",
            },
            sidebar: [
                {
                    label: "ガイド",
                    items: [
                        { label: "インストール", slug: "guides/install" },
                        { label: "機能", slug: "guides/feature" },
                    ],
                },
            ],
            tableOfContents: {
                minHeadingLevel: 2,
                maxHeadingLevel: 4,
            },
            pagefind: false,
            components: {
                Footer: "./src/components/Footer.astro",
            },
        }),
    ],
});
