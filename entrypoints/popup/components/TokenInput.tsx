export function TokenInput(props: { token: string | undefined }) {
	const [token, setToken] = createSignal("");
	const [isSaved, setIsSaved] = createSignal(false);

	createEffect(() => {
		if (props.token) setToken(props.token);
	});

	async function saveToken(token: string) {
		const trimedToken = token.trim();
		await browser.storage.local.set({ Token: trimedToken });
		setToken(trimedToken);
		setIsSaved(true);
	}

	function openNewTab() {
		browser.tabs.create({
			url: "https://developers.annict.com/docs/authentication/personal-access-token",
		});
	}

	return (
		<div class="token-container">
			<span>Annictのトークンを入力</span>
			<input
				onChange={(e) => saveToken(e.target.value)}
				value={token()}
				placeholder="トークンを入力"
				type="textbox"
				spellcheck={false}
			/>
			<div>
				<Show when={isSaved()}>
					<span>保存完了</span>
				</Show>
				<a onClick={openNewTab} href="#">
					トークンの取得方法
					<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M22 2.00001L11.75 12.25"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
						<path
							d="M21.9998 6.49999L21.9998 1.99999L17.0568 1.99999"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
						<path
							d="M11 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V12.75"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
					</svg>
				</a>
			</div>
		</div>
	);
}
