export function SendTimingOptions(props: { sendTiming: string }) {
	const [selectedTiming, setSelectedTiming] = createSignal(props.sendTiming);
	createEffect(() => {
		setSelectedTiming(props.sendTiming);
	});

	const options = [
		{ value: "not-send", label: "自動送信しない" },
		{ value: "after-start", label: "再生開始から5分後" },
		{ value: "after-end", label: "再生終了後" },
	];

	async function handleChange(value: string) {
		setSelectedTiming(value);
		await storage.setItem("local:sendTiming", value);
	}

	return (
		<div class="radio-checkbox-container send-timing-container px-2 py-4">
			<h2 class="font-semibold text-lg m-0">視聴データの送信タイミング</h2>
			<div class="mt-2">
				<Index each={options}>
					{(option) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1">
							<input
								class="radio w-[1.1rem] h-[1.1rem] mr-3 my-auto cursor-pointer
                                    border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400
									checked:bg-blue-800 dark:checked:bg-blue-600 checked:border-blue-800 dark:checked:border-blue-600
									checked:hover:bg-blue-1000 dark:checked:hover:bg-blue-400 checked:hover:border-blue-1000 dark:checked:hover:border-blue-400"
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
