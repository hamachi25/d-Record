import { setLoading } from "./anime-data-scraper";

async function getToken() {
	const result = await browser.storage.local.get(["Token"]);
	const token = result.Token;
	if (!token) throw new Error("Annictトークンエラー");
	return token;
}

/**
 * エラーごとにメッセージを表示するメッセージを設定
 */
function handleFetchError(error: Error) {
	setLoading("icon", "immutableNotUpload");
	switch (error.message) {
		case "Annictトークンエラー":
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
	}
}

export async function fetchDataFromAnnict(query: string) {
	try {
		const token = await getToken();
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
		return false;
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
		return false;
	}
}
