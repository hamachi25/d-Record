export function TokenInput() {
	const [tokenStatus, setTokenStatus] = createSignal<"idle" | "loading" | "fetched">("idle");

	async function getToken() {
		setTokenStatus("loading");
		const response = await browser.runtime.sendMessage("startOAuth");
		if (response) {
			setTokenStatus("fetched");
		} else {
			setTokenStatus("idle");
		}
	}

	async function revokeToken() {
		const response = await browser.runtime.sendMessage("revokeToken");
		if (response) {
			setTokenStatus("idle");
		} else {
			setTokenStatus("fetched");
		}
	}

	let dialogElement: HTMLDialogElement | undefined;
	function openModal() {
		if (dialogElement) dialogElement.showModal();
	}

	function openNewTab() {
		browser.tabs.create({
			url: "https://developers.annict.com/docs/authentication/personal-access-token",
		});
	}

	// 手動入力したトークンを保存
	let tokenInputElement: HTMLInputElement | undefined;
	async function saveToken() {
		const trimedToken = tokenInputElement?.value.trim();
		if (!tokenInputElement || !trimedToken) return;
		await Promise.all([
			storage.setItem("local:Token", trimedToken),
			storage.setMeta("local:Token", { oauth: false }),
		]);
		setTokenStatus("fetched");
		tokenInputElement.value = "";
	}

	onMount(async () => {
		const token = await storage.getItem<string>("local:Token");
		if (token && token !== "") {
			setTokenStatus("fetched");
		} else {
			setTokenStatus("idle");
		}
	});

	return (
		<div class="px-2 py-4">
			<p class="font-semibold text-lg m-0">トークン</p>
			<div class="mt-2 flex items-end justify-between">
				<Switch>
					<Match when={tokenStatus() === "idle"}>
						<button class="btn  mr-3 h-10 min-h-10 gap-1" onclick={getToken}>
							トークンを取得
							<svg
								class="w-4 h-4"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z"></path>
							</svg>
						</button>
					</Match>
					<Match when={tokenStatus() === "loading"}>
						<button class="btn btn-square h-10 min-h-10">
							<span class="loading loading-spinner"></span>
						</button>
					</Match>
					<Match when={tokenStatus() === "fetched"}>
						<button class="btn mr-3 h-10 min-h-10 gap-1">
							設定済み
							<svg
								class="w-5 h-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="rgba(2,179,98,1)"
							>
								<path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
							</svg>
						</button>
					</Match>
				</Switch>
				<div class="dropdown dropdown-bottom dropdown-end">
					<div
						tabindex="0"
						role="button"
						class="btn btn-ghost btn-sm font-medium text-xs gap-0"
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
					</div>
					<ul
						tabindex="0"
						class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
					>
						<Show
							when={tokenStatus() === "fetched"}
							fallback={
								<li>
									<a onClick={openModal}>トークンを手動入力</a>
								</li>
							}
						>
							<li>
								<a onClick={revokeToken}>トークンを削除</a>
							</li>
						</Show>

						<dialog id="my_modal_1" class="modal hidden-scrollbar" ref={dialogElement}>
							<div class="modal-box">
								<h3 class="text-lg font-bold pb-4">トークンを手動入力</h3>
								<input
									type="text"
									placeholder="トークンを入力"
									class="input input-bordered w-full max-w-xs"
									ref={tokenInputElement}
								/>
								<div class="flex justify-end mt-1">
									<a class="flex link link-info" onClick={openNewTab} href="#">
										トークンの取得方法
										<svg
											class="w-5 h-5"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
										>
											<path d="M10 6V8H5V19H16V14H18V20C18 20.5523 17.5523 21 17 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6H10ZM21 3V11H19L18.9999 6.413L11.2071 14.2071L9.79289 12.7929L17.5849 5H13V3H21Z"></path>
										</svg>
									</a>
								</div>
								<div class="modal-action">
									<form method="dialog">
										<button class="btn" onclick={saveToken}>
											保存
										</button>
									</form>
								</div>
							</div>
							<form method="dialog" class="modal-backdrop hidden-scrollbar">
								<button>close</button>
							</form>
						</dialog>
					</ul>
				</div>
			</div>
		</div>
	);
}
