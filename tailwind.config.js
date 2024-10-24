/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
	content: ["assets/**", "entrypoints/**", "components/**"],
	theme: {
		extend: {
			colors: {
				blue: {
					50: "#E8F1FE",
					100: "#D9E6FF",
					200: "#C5D7FB",
					300: "#9DB7F9",
					400: "#7096F8",
					500: "#4979F5",
					600: "#3460FB",
					700: "#264AF4",
					800: "#0031D8",
					900: "#0017C1",
					1000: "#00118F",
					1100: "#000071",
					1200: "#000060",
				},
				orange: {
					50: "#FFEEE2",
					100: "#FFDFCA",
					200: "#FFC199",
					300: "#FFA66D",
					400: "#FF8D44",
					500: "#FF7628",
					600: "#FB5B01",
					700: "#E25100",
					800: "#C74700",
					900: "#AC3E00",
					1000: "#8B3200",
					1100: "#6D2700",
					1200: "#541E00",
				},
			},
		},
	},
	plugins: [daisyui],
};
