import { settingData } from "./storage";

function getToken(): string {
	const token = settingData.Token;
	if (!token) {
		console.error("Annictのトークンがありません");
		throw new Error("Annictのトークンがありません");
	}
	return token;
}

export async function fetchData(query: string): Promise<Response> {
	const token = getToken();
	try {
		const response = await fetch("https://api.annict.com/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: query,
		});

		if (!response.ok) {
			throw new Error("ネットワークエラー");
		}

		return response;
	} catch (error) {
		console.error(error);
		throw Error;
	}
}

export async function fetchDataFromDanime(workId: number) {
	const requestURL = "https://animestore.docomo.ne.jp/animestore/ci_pc?workId=" + workId;
	try {
		const response = await fetch(requestURL);

		if (!response.ok) {
			throw new Error("ネットワークエラー");
		}

		return await response.text();
	} catch (error) {
		console.error(error);
		throw Error;
	}
}
