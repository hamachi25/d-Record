/* 再生ページのアニメタイトル */

import { animeData, loading } from "../anime-data-scraper";

export default function AnimeTitle(props: { webSite: string }) {
	const [show, setShow] = createSignal(false);

	// アニメタイトルを表示
	createEffect(() => {
		let timeoutID: NodeJS.Timeout;
		if (animeData.title) {
			setShow(true);
			timeoutID = setTimeout(() => setShow(false), 4000); // 4秒後に非表示
		}
		onCleanup(() => clearTimeout(timeoutID));
	});

	return (
		<Switch>
			<Match when={props.webSite === "abema"}>
				<span
					class="max-w-[300px] translate-x-[30px] h-full text-white font-medium overflow-x-hidden text-ellipsis whitespace-nowrap invisible opacity-0 transition-all duration-300 [&.show]:translate-x-0 [&.show]:visible [&.show]:opacity-100"
					classList={{ show: show() }}
				>
					{!loading.message && animeData.title}
				</span>
			</Match>
			<Match when={props.webSite === "danime"}>
				<div id="upload-anime-title" classList={{ show: show() }}>
					<span classList={{ show: show() }}>{!loading.message && animeData.title}</span>
				</div>
			</Match>
		</Switch>
	);
}
