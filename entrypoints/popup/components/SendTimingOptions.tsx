export function SendTimingOptions(props: { sendTiming: string | undefined }) {
	const [selectedTiming, setSelectedTiming] = createSignal("after-end");
	const [options] = createSignal([
		{ value: "not-send", label: "自動送信しない" },
		{ value: "after-start", label: "再生開始から5分後" },
		{ value: "after-end", label: "再生終了後" },
	]);

	// 遅延して取得した設定を反映
	createEffect(() => {
		if (props.sendTiming) setSelectedTiming(props.sendTiming);
	});

	async function handleChange(value: string) {
		await browser.storage.local.set({ sendTiming: value });
		setSelectedTiming(value);
	}

	return (
		<div class="radio-checkbox-container send-timing-container px-2 py-4">
			<h2 class="font-semibold text-lg m-0">視聴データの送信タイミング</h2>
			<div class="mt-2">
				<Index each={options()}>
					{(option) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1">
							<input
								class="radio border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400
									checked:bg-blue-800 dark:checked:bg-blue-600 checked:border-blue-800 dark:checked:border-blue-600
									checked:hover:bg-blue-1000 dark:checked:hover:bg-blue-400 checked:hover:border-blue-1000 dark:checked:hover:border-blue-400
									w-[1.1rem] h-[1.1rem] mr-3 my-auto cursor-pointer"
								type="radio"
								value={option().value}
								checked={selectedTiming() === option().value}
								onChange={() => handleChange(option().value)}
							/>
							{option().label}
						</label>
					)}
				</Index>
			</div>
		</div>
	);
}
