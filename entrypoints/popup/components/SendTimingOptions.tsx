export function SendTimingOptions(props: { sendTiming: string | undefined }) {
	const [selectedTiming, setSelectedTiming] = createSignal("after-end");
	const [options] = createSignal([
		{ value: "not-send", label: "自動送信しない" },
		{ value: "after-start", label: "再生開始から5分後" },
		{ value: "after-end", label: "再生終了後" },
	]);

	createEffect(() => {
		if (props.sendTiming) setSelectedTiming(props.sendTiming);
	});

	async function handleChange(value: string) {
		await browser.storage.local.set({ sendTiming: value });
		setSelectedTiming(value);
	}

	return (
		<div class="radio-checkbox-container send-timing-container px-2 py-4">
			<p class="font-semibold text-lg m-0">視聴データの送信タイミング</p>
			<div class="mt-2">
				<Index each={options()}>
					{(option) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1">
							<input
								class="min-w-4 min-h-4 mr-3 my-auto cursor-pointer"
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
