import { CheckboxGroup } from "./CheckboxGroup";

type Props = {
	applyWebsite: { [key: string]: boolean };
};

const options = [
	{ value: "danime", label: "dアニメストア" },
	{ value: "abema", label: "ABEMA" },
];

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
			title={"使用するウェブサイト"}
			options={options}
			ischecked={applyWebsite}
			handleChange={handleChange}
		/>
	);
}
