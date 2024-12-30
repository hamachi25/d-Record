// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
    site: "https://d-record.hamachi25.com",
    integrations: [
        starlight({
            title: "d-Record",
            locales: {
                root: {
                    label: "日本語",
                    lang: "ja",
                },
            },
            logo: {
                light: "./src/assets/light-title.svg",
                dark: "./src/assets/dark-title.svg",
                replacesTitle: true,
            },
            social: {
                github: "https://github.com/hamachi25/d-Record",
                twitter: "https://x.com/FisqWclCKB8xtLC",
            },
            sidebar: [
                { label: "インストール", slug: "install" },
                { label: "機能一覧", slug: "feature" },
                { label: "Q&A", slug: "qa" },
            ],
            tableOfContents: {
                minHeadingLevel: 2,
                maxHeadingLevel: 4,
            },
            pagefind: false,
            head: [
                {
                    tag: "meta",
                    attrs: {
                        name: "google-site-verification",
                        content: "IX_BtfrZkqoIAYxiNbckPHxuTa1RLD7S7Mu1zJfMPfM",
                    },
                },
            ],
            components: {
                SocialIcons: "./src/components/SocialIcons.astro",
            },
        }),
    ],
});
