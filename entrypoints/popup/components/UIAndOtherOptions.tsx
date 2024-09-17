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
		<div class="radio-checkbox-container">
			<p>{props.title}</p>
			<div>
				<For each={props.options}>
					{(option, i) => (
						<label>
							<input
								type="checkbox"
								id={option.value}
								checked={ischecked()[i()].checked}
								onChange={() => handleChange(option.value)}
							/>
							{option.label}
						</label>
					)}
				</For>
			</div>
		</div>
	);
}
