export function TokenInput() {
	const [tokenStatus, setTokenStatus] = createSignal<"idle" | "loading" | "fetched">("idle");

	async function fetchToken() {
		setTokenStatus("loading");
		const response = await browser.runtime.sendMessage("startOAuth");
		if (response) {
			setTokenStatus("fetched");
		} else {
			setTokenStatus("idle");
		}
	}

	async function revokeToken() {
		setTokenStatus("loading");
		const response = await browser.runtime.sendMessage("revokeToken");
		if (response) {
			setTokenStatus("idle");
		} else {
			setTokenStatus("fetched");
		}
	}

	// モーダルを開く
	let dialogElement!: HTMLDialogElement;
	function openModal() {
		dialogElement.showModal();
	}

	// オプションのドロップメニューを閉じる
	let detailsElement!: HTMLDetailsElement;
	function closeDropDown(event: Event) {
		const target = event.target as Node;
		if (!detailsElement.contains(target)) {
			detailsElement.removeAttribute("open");
		}
	}
	createEffect(() => {
		if (detailsElement) {
			window.addEventListener("click", closeDropDown);
		}
		onCleanup(() => {
			window.addEventListener("click", closeDropDown);
		});
	});

	function openNewTab() {
		browser.tabs.create({
			url: "https://developers.annict.com/docs/authentication/personal-access-token",
		});
	}

	let tokenInputElement!: HTMLInputElement;
	async function saveToken() {
		const trimedToken = tokenInputElement.value.trim();
		if (!trimedToken) return;

		setTokenStatus("fetched");
		tokenInputElement.value = "";

		await Promise.all([
			storage.setItem("local:Token", trimedToken),
			storage.setMeta("local:Token", { oauth: false }),
		]);
	}

	onMount(async () => {
		const token = await storage.getItem("local:Token");
		if (token && token !== "") {
			setTokenStatus("fetched");
		} else {
			setTokenStatus("idle");
		}
	});

	return (
		<div class="px-2 py-4">
			<h2 class="font-semibold text-lg m-0">トークン</h2>
			<div class="flex items-end justify-between">
				<Switch>
					<Match when={tokenStatus() === "idle"}>
						<button
							class="btn bg-orange-600 hover:bg-orange-800 active:bg-orange-1000 dark:bg-orange-700 dark:hover:bg-orange-600 dark:active:bg-orange-500 text-white text-[15px] mr-3 h-10 min-h-10 gap-1"
							onclick={fetchToken}
						>
							トークンを取得
							<svg
								class="w-5 h-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19Z"></path>
							</svg>
						</button>
					</Match>
					<Match when={tokenStatus() === "loading"}>
						<button class="btn btn-square h-10 min-h-10">
							<span class="loading loading-spinner"></span>
						</button>
					</Match>
					<Match when={tokenStatus() === "fetched"}>
						<button class="btn text-[15px] mr-3 h-10 min-h-10 gap-1">
							設定済み
							<svg
								class="w-6 h-6"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="rgba(2,179,98,1)"
							>
								<path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
							</svg>
						</button>
					</Match>
				</Switch>

				{/* オプション */}
				<details class="dropdown dropdown-bottom dropdown-end" ref={detailsElement}>
					<summary
						tabindex="0"
						role="button"
						class="btn btn-ghost btn-sm font-medium text-sm gap-0"
					>
						オプション
						<svg
							class="w-4 h-4"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path>
						</svg>
					</summary>

					{/* ドロップメニュー */}
					<ul
						tabindex="0"
						class="dropdown-content menu bg-base-100 border border-gray-100 dark:border-none rounded-lg z-[1] w-52 p-2 shadow-lg"
					>
						<Show
							when={tokenStatus() === "fetched"}
							fallback={
								<li>
									<a
										onClick={(e) => {
											openModal();
											closeDropDown(e);
										}}
									>
										トークンを手動入力
									</a>
								</li>
							}
						>
							<li>
								<a
									onClick={(e) => {
										revokeToken();
										closeDropDown(e);
									}}
								>
									トークンを削除
								</a>
							</li>
						</Show>
					</ul>
				</details>

				{/* モーダル */}
				<dialog id="my_modal_1" class="modal hidden-scrollbar" ref={dialogElement}>
					<div class="modal-box rounded-lg">
						<h3 class="text-lg font-bold pb-4">トークンを手動入力</h3>
						<input
							type="text"
							class="input input-bordered w-full max-w-xs"
							ref={tokenInputElement}
						/>
						<div class="flex justify-end mt-1">
							<a
								class="flex link text-sm text-blue-1000 dark:text-blue-600 underline-offset-2 hover:decoration-2"
								onClick={openNewTab}
								href="#"
							>
								トークンの取得方法
								<svg
									class="w-4 h-4"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path>
								</svg>
							</a>
						</div>
						<div class="modal-action flex justify-between mt-6">
							<form method="dialog">
								<button class="btn btn-link px-2 underline-offset-2 text-blue-800 dark:text-blue-600 hover:text-blue-1000 dark:hover:text-blue-500 active:text-blue-1200 dark:active:text-blue-400 h-9 min-h-9">
									閉じる
								</button>
							</form>
							<form method="dialog">
								<button
									class="btn bg-blue-800 dark:bg-blue-700 hover:bg-blue-1000 dark:hover:bg-blue-600 active:bg-blue-1200 dark:active:bg-blue-500 text-white text-base h-9 min-h-9 w-20"
									onclick={saveToken}
								>
									保存
								</button>
							</form>
						</div>
					</div>
					<form method="dialog" class="modal-backdrop hidden-scrollbar">
						<button>close</button>
					</form>
				</dialog>
			</div>
		</div>
	);
}
