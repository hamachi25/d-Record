import { Accessor } from "solid-js";
import { Settings } from "../type";

export function SelectWebsite(props: { settings: Accessor<Settings> }) {
	const [options, setOptions] = createSignal<
		{ value: string; label: string; checked: boolean }[]
	>([]);

	createEffect(() => {
		const settings = props.settings();
		setOptions([
			{
				value: "danime",
				label: "dアニメストア",
				checked: settings.applyWebsite?.danime ?? true,
			},
			{
				value: "abema",
				label: "ABEMA",
				checked: settings.applyWebsite?.abema ?? true,
			},
		]);
	});

	async function handleChange(value: string, isChecked: boolean) {
		const updatedOptions = options().map((option) => {
			if (option.value === value) {
				option.checked = isChecked;
			}
			return option;
		});
		setOptions(updatedOptions);

		const result = {
			applyWebsite: updatedOptions.reduce(
				(acc, curr) => {
					acc[curr.value] = curr.checked;
					return acc;
				},
				{} as Record<string, boolean>,
			),
		};

		await browser.storage.local.set(result);
	}

	return (
		<div class="radio-checkbox-container send-timing-container px-2 py-4">
			<h2 class="font-semibold text-lg m-0">使用するウェブサイト</h2>
			<div class="mt-2">
				<Index each={options()}>
					{(option) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1.5">
							<input
								class="checkbox h-[1.1rem] w-[1.1rem] border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 checked:border-none
									[--chkbg:theme(colors.blue.800)] dark:[--chkbg:theme(colors.blue.600)] checked:hover:[--chkbg:theme(colors.blue.1000)] dark:checked:hover:[--chkbg:theme(colors.blue.400)]
									rounded mr-3 my-auto cursor-pointer"
								type="checkbox"
								checked={option().checked}
								onChange={(e) => handleChange(option().value, e.target.checked)}
							/>
							{option().label}
						</label>
					)}
				</Index>
			</div>
		</div>
	);
}
