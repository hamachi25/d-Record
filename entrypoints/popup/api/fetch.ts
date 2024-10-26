async function getToken() {
	const result = await browser.storage.local.get(["Token"]);
	const token = result.Token;
	if (!token) return false;
	return token;
}

export async function fetchDataFromAnnict(query: string) {
	try {
		const token = await getToken();
		if (!token) return "token";

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
	} catch {
		return false;
	}
}

export async function fetchDataFromDanime(name: string) {
	const requestURL = `https://animestore.docomo.ne.jp/animestore/rest/v1/works?work_id=${name}`;
	try {
		const response = await fetch(requestURL);

		if (!response.ok) throw new Error("dアニメサーバーエラー");

		return await response.json();
	} catch {
		return false;
	}
}
