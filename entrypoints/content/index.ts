export default defineContentScript({
	matches: ["https://animestore.docomo.ne.jp/*"],
	main() {
		console.log("Hello content.");
	},
});
