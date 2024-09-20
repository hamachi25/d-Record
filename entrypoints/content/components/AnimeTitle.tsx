import { animeData } from "../anime-data-scraper";

export function AnimeTitle() {
	const [show, setShow] = createSignal(true);

	const timeoutID = setTimeout(() => setShow(false), 4000);

	onCleanup(() => clearTimeout(timeoutID));

	return (
		<div id="upload-anime-title" classList={{ show: show() }}>
			<span classList={{ show: show() }}>{animeData.title}</span>
		</div>
	);
}
