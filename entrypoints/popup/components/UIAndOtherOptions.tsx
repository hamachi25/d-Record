export function UIAndOtherOptions(props: {
	title: string;
	options: { value: string; label: string }[];
	settings: { [key: string]: boolean | undefined };
}) {
	const [ischecked, setChecked] = createSignal(
		props.options.map((option) => ({ value: option.value, checked: false })),
	);

	// 遅延して取得した設定を反映
	createEffect(
		on(
			() => Object.values(props.settings),
			() => {
				const newChecked = ischecked().map((check) => {
					const newValue = props.settings[check.value] ?? check.checked;
					return {
						...check,
						checked: newValue,
					};
				});
				setChecked(newChecked);
			},
			{ defer: true },
		),
	);

	// チェックボックスの状態を変更
	async function handleChange(value: string) {
		const newChecked = ischecked().map((check) => ({
			...check,
			checked: check.value === value ? !check.checked : check.checked,
		}));
		setChecked(newChecked);

		await browser.storage.local.set({
			[value]: newChecked.find((o) => o.value === value)?.checked,
		});
	}

	return (
		<div class="radio-checkbox-container px-2 py-4">
			<h2 class="font-semibold text-lg m-0">{props.title}</h2>
			<div class="mt-2">
				<Index each={props.options}>
					{(option, i) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1.5">
							<input
								class="checkbox h-[1.1rem] w-[1.1rem] border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 checked:border-none
								[--chkbg:theme(colors.blue.800)] dark:[--chkbg:theme(colors.blue.600)] checked:hover:[--chkbg:theme(colors.blue.1000)] dark:checked:hover:[--chkbg:theme(colors.blue.400)] 
								rounded mr-3 my-auto cursor-pointer"
								type="checkbox"
								id={option().value}
								checked={ischecked()[i].checked}
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
