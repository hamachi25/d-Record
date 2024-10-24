import { CheckboxGroup } from "./CheckboxGroup";

type Props = {
	title: string;
	options: { value: string; label: string }[];
	settings: { [key: string]: boolean };
};

export function UIAndOtherOptions(props: Props) {
	const [checked, setChecked] = createStore(props.settings);
	createEffect(() => {
		setChecked(props.settings);
	});

	async function handleChange(value: string, isChecked: boolean) {
		setChecked((prev) => ({
			...prev,
			[value]: isChecked,
		}));

		await storage.setItem(`local:${value}`, isChecked);
	}

	return (
		<CheckboxGroup
			title={props.title}
			options={props.options}
			ischecked={checked}
			handleChange={handleChange}
		/>
	);
}
