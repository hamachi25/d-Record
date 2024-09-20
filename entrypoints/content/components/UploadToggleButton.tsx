import "~/assets/UploadToggleButton.css";
import { AnimeTitle } from "./AnimeTitle";
import { animeData } from "../anime-data-scraper";
import { cleanupIntervalOrEvent, createIntervalOrEvent } from "../record-watch-episode";
import { getNotRecordWork } from "../storage";

const [uploadIcon, setUploadIcon] = createSignal("upload");
export { setUploadIcon };

const uploadIconBase64 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABJ0lEQVRYhe2XsW3DMBBFn4IM4FGUCaz0LjKC07pKNuAIHkEj2Bs4G2iEuEtpd+kuDQMTMo/WUbYIB/kAIepE3j3pTiRYiQgl9VA0+hUAFr7lS0Ry20pOWuX6yQ2+lHMtpwKIBc+GsAavg2DfCkRt8Wktwpm/HoE2sG+D/sHi0ArQAc9ADXz17E/+2afF4aMR4ADsEnBmaV/AARJp7QCfrTLXRUcrxZHS2o9xgc152/rC3NFF2C++2NsfLQ6H1MAHp7xvSOe6Axrgxd83wHwswA4tfzrEL6S7BHD3u2FRgE7pm2RdiEJtgNegPzkADFuYkrrrGvgbAENqoMG2EPXnJlVJ/Fxwq8NC1TdoKTBtKGOkAbwB+yvG2QPvsQdaCiZT8b/gH6A4wA9MTTwvPMgvWAAAAABJRU5ErkJggg==";
const notUploadIconBase64 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAWJAAAFiQFtaJ36AAABv0lEQVRYhdWXMU7DMBSGvyIOkBvAyEZgYS0MiAEJNiQWMneh3CDcoNygDDCHka2cgHZjLBuIpRULTI/Btmocp42TlIpfsho9P/v/+/L7WWmJCKvE2krZGxBwrEd1iEjV0ZEZOlX3qUqeSB7JXwnwkZcVEdcVEFtkXwUiciQiEolIZuWkZi7UhJH+nQJ9K/5gPU+cNTEwBE58G4YKGAL7etM3J76j58ZWPAEGwIazz8A8rAcKmNiLPeJs9IBLJza1RAHFFUgB8Yx+CZH3OtclfwfaQPYrWmC2eejpnNRjqrsFa3NcoR5wzWejC5wH7lfKA0/M3llG/l0DnALbTuwbePHEgwUMUJ6YB5dkhHrf3UUC6lxGWwXxG9QxdfuBF6HH0CAFzpzYFPWP+yEbhQqINIHb1T6AQ/z+aExAjDKh29WegQNKltxFWQ8k+FvqNbBblRzKVeAI2HNipqVmuewlCHDJR6hzP65LDuHH8BZ1vhshB38FugW5j5q4aN6H9qKElsy+CyLUFXoRQBCKlhswFYhQLp/bNpcB44HYQ/7ZIM8rcOWbMBXYtGKVWmpVGA9s6tGm+MpdqoCV4d9/nNbGD5zxXDUg8eVTAAAAAElFTkSuQmCC";
const completeUploadIconBase64 =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcZJREFUeNpiYBgFo2AkAWUJUQV0MWY6WSygLCd73NvPv0OQh7vh7/evjO+/fDtAL18LmGipn7925fJ/GMhIiPsPFDcAyTPRwQ37F61aY6CprQMX0NQBswXo4fv5a1cs/48MPn788N/fzeU9KGRwagSqm/8fNwjAoy8ApqgsP/c/uuUwcaDlCXhd/h8/2I9H336Qgok9XWBMluVEOKABj75+kK9BFqGD5tpqkOUFRMUduo9Bli6cM/t+Z3PjeWx5GSnOE7BZDnMU0YkH3cegbDR/1sz/u7ZvgyUgAyyWO/g4O+K0HATIcsC2TRv3g4IPSypOQLLcACQGkkMGIAdHBcHTJfkOQE9QIItAvgU5ApfloIIHZDmyOFkOeP70ab+xptp95JIM5ghQiWakrvoeXQ7EB0UbSC+yONlpAFtxCgNPHj3CcBjIUaDECtJLFQfgKtPRAVL6MICaQz0HEHIEuuU0cQA+R0BruAQ0c6jvAGRHgMqGE0ePYrWcWAcw4nIAEhfUcDiIrubFs2f8wHwe8OHDewVVNfUDnr5+B7EYZQ/EDnDLgIAcB1ANYHMAPRokeAEuBxQC8Qcq2gMya8Jos3wUDEoAEGAAfIZhhifLZSgAAAAASUVORK5CYII=";

export function UploadToggleButton() {
	const [isIconDisplayed, setIconDisplayed] = createSignal(uploadIconBase64);

	const partId = location.href.match(/(?<=partId=)\d+/);
	const workId = partId && partId[0].substring(0, 5);

	async function changeUploadToggle() {
		if (uploadIcon() === "immutableNotUpload" || uploadIcon() === "completeUpload") return;

		const notRecordWork = await getNotRecordWork();

		if (uploadIcon() === "upload") {
			setUploadIcon("notUpload");

			cleanupIntervalOrEvent();

			if (!notRecordWork.includes(Number(workId))) {
				notRecordWork.push(Number(workId));
				browser.storage.local.set({ notRecordWork: notRecordWork });
			}
		} else if (uploadIcon() === "notUpload") {
			setUploadIcon("upload");

			createIntervalOrEvent();

			const newNotRecordWork = notRecordWork.filter((item: number) => item !== Number(workId));
			browser.storage.local.set({ notRecordWork: newNotRecordWork });
		}
	}

	createEffect(() => {
		switch (uploadIcon()) {
			case "upload":
				setIconDisplayed(uploadIconBase64);
				break;
			case "notUpload":
				setIconDisplayed(notUploadIconBase64);
				break;
			case "immutableNotUpload":
				setIconDisplayed(notUploadIconBase64);
				break;
			case "completeUpload":
				setIconDisplayed(completeUploadIconBase64);
				break;
		}
	});

	return (
		<>
			<AnimeTitle />
			<div id="upload-icon-container" title={animeData.title} onClick={changeUploadToggle}>
				<img
					id="upload-icon"
					src={isIconDisplayed()}
					classList={{
						"not-upload-icon":
							uploadIcon() === "immutableNotUpload" || uploadIcon() === "completeUpload",
					}}
				/>
			</div>
		</>
	);
}
