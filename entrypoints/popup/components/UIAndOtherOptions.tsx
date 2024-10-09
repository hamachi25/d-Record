export function UIAndOtherOptions(props: {
	title: string;
	options: { value: string; label: string }[];
	settings: { [key: string]: boolean | undefined };
}) {
	const [ischecked, setChecked] = createSignal(
		props.options.map((option) => ({ value: option.value, checked: false })),
	);

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
			<p class="font-semibold text-lg m-0">{props.title}</p>
			<div class="mt-2">
				<Index each={props.options}>
					{(option, i) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1">
							<input
								class="min-w-4 min-h-4 mr-3 my-auto cursor-pointer"
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
