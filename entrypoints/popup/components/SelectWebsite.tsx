import { CheckboxGroup } from "./CheckboxGroup";

type Props = {
	title: string;
	options: { value: string; label: string }[];
	applyWebsite: { [key: string]: boolean };
};

export function SelectWebsite(props: Props) {
	const [applyWebsite, setApplyWebsite] = createStore(props.applyWebsite);
	createEffect(() => {
		setApplyWebsite(props.applyWebsite);
	});

	async function handleChange(value: string, isChecked: boolean) {
		setApplyWebsite((prev) => ({
			...prev,
			[value]: isChecked,
		}));

		await storage.setItem("local:applyWebsite", applyWebsite);
	}

	return (
		<CheckboxGroup
			title={props.title}
			options={props.options}
			ischecked={applyWebsite}
			handleChange={handleChange}
		/>
	);
}
