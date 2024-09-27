import { setUploadIcon } from "./components/UploadToggleButton";
import { setLoading } from "./anime-data-scraper";
import { settingData } from "./storage";

function getToken(): string {
	const token = settingData.Token;
	if (!token) throw new Error("Annictのトークンがありません");
	return token;
}

function handleFetchError(error: Error) {
	setUploadIcon("immutableNotUpload");
	switch (error.message) {
		case "Annictのトークンがありません":
			setLoading({ status: "error", message: "Annictのトークンを設定してください" });
			break;
		case "Annictサーバーエラー":
			setLoading({
				status: "error",
				message: "Annictのサーバーエラーにより、データ取得に失敗しました",
			});
			break;
		case "dアニメサーバーエラー":
			setLoading({
				status: "error",
				message: "dアニメストアのサーバーエラーにより、データ取得に失敗しました",
			});
			break;
		default:
			setLoading({ status: "error", message: "通信に失敗しました" });
			throw new Error("通信に失敗しました");
	}
}

export async function fetchData(query: string): Promise<Response> {
	try {
		const token = getToken();
		const response = await fetch("https://api.annict.com/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: query,
		});

		if (!response.ok) throw new Error("Annictサーバーエラー");

		return response;
	} catch (error) {
		if (error instanceof Error) handleFetchError(error);
		throw error;
	}
}

export async function fetchDataFromDanime(workId: number) {
	const requestURL = "https://animestore.docomo.ne.jp/animestore/ci_pc?workId=" + workId;
	try {
		const response = await fetch(requestURL);

		if (!response.ok) throw new Error("dアニメサーバーエラー");

		return await response.text();
	} catch (error) {
		if (error instanceof Error) handleFetchError(error);
		throw error;
	}
}
