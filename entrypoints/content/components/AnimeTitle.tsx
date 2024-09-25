import { currentAnimeData } from "../anime-data-scraper";

export function AnimeTitle() {
	const [show, setShow] = createSignal(false);

	createEffect(() => {
		let timeoutID: NodeJS.Timeout;
		if (currentAnimeData.title) {
			setShow(true);
			timeoutID = setTimeout(() => setShow(false), 4000);
		}
		onCleanup(() => clearTimeout(timeoutID));
	});

	return (
		<div id="upload-anime-title" classList={{ show: show() }}>
			<span classList={{ show: show() }}>{currentAnimeData.title}</span>
		</div>
	);
}
