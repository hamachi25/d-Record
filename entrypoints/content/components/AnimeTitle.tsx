import { animeDataSignal } from "../anime-data-scraper";

export function AnimeTitle() {
	const [show, setShow] = createSignal(false);

	createEffect(() => {
		let timeoutID: NodeJS.Timeout;
		if (animeDataSignal()?.title) {
			setShow(true);
			timeoutID = setTimeout(() => setShow(false), 4000);
		}
		onCleanup(() => clearTimeout(timeoutID));
	});

	return (
		<div id="upload-anime-title" classList={{ show: show() }}>
			<span classList={{ show: show() }}>{animeDataSignal()?.title}</span>
		</div>
	);
}
