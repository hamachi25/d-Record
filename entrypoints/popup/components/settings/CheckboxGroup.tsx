type Props = {
	title: string;
	options: { value: string; label: string }[];
	ischecked: { [key: string]: boolean };
	handleChange(value: string, isChecked: boolean): Promise<void>;
};

export function CheckboxGroup(props: Props) {
	return (
		<div class="radio-checkbox-container px-2 py-4">
			<h2 class="font-semibold text-lg m-0">{props.title}</h2>
			<div class="mt-2">
				<Index each={props.options}>
					{(option) => (
						<label class="relative flex items-center cursor-pointer [&:not(:last-child)]:mb-1.5">
							<input
								class="checkbox h-[1.1rem] w-[1.1rem] rounded mr-3 my-auto cursor-pointer
                                    border-gray-400 dark:border-gray-600 hover:border-gray-600 dark:hover:border-gray-400 checked:border-none
                                    [--chkbg:theme(colors.blue.800)] dark:[--chkbg:theme(colors.blue.500)]
                                    checked:hover:[--chkbg:theme(colors.blue.1000)] dark:checked:hover:[--chkbg:theme(colors.blue.400)]"
								type="checkbox"
								id={option().value}
								checked={props.ischecked[option().value]}
								onChange={(e) =>
									props.handleChange(option().value, e.target.checked)
								}
							/>
							{option().label}
						</label>
					)}
				</Index>
			</div>
		</div>
	);
}
