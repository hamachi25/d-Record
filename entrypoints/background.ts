const CLIENT_ID = "AJQMtwECb8Ulf-qS6g1YwI4IGkNezPvju50R2PzxGlY";
const WORKER_URL = "https://d-record.hamachi.workers.dev";

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(async (message) => {
		if (message === "startOAuth") {
			/* OAuth認証 */
			return startOAuth().then((res) => {
				return Promise.resolve(res);
			});
		} else if (message === "revokeToken") {
			/* トークンを削除 */
			return revokeToken().then((res) => {
				return Promise.resolve(res);
			});
		}

		return false;
	});
});

async function getToken() {
	const token = await storage.getItem<string>("local:Token");
	return token;
}

async function getTokenMeta() {
	const tokenMeta = await storage.getMeta("local:Token");
	return tokenMeta;
}

async function revokeToken() {
	// トークンが手動入力の場合は、ストレージから削除するだけ
	const tokenMeta = await getTokenMeta();
	if (tokenMeta.length === 0 || tokenMeta.oauth === false) {
		await storage.setItem("local:Token", "");
		await storage.removeMeta("local:Token");
		return true;
	}

	// トークンがOAuth認証の場合は、サーバーにリクエストを送信して削除
	try {
		const token = await getToken();
		if (!token || token === "") return false;

		const response = await fetch(`${WORKER_URL}/revoke`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(token),
		});

		if (!response.ok) {
			throw new Error(`サーバーエラー: ${response.status}`);
		}

		await storage.setItem("local:Token", "");
		await storage.removeMeta("local:Token");
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

function generateState(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array, (num) => num.toString(36)).join("");
}

function validateState(originalState: string, returnedState: string | null): boolean {
	return originalState === returnedState;
}

async function startOAuth() {
	const state = generateState();

	const redirectURL = browser.identity.getRedirectURL();
	const authUrl =
		`https://annict.com/oauth/authorize?` +
		`client_id=${CLIENT_ID}` +
		`&response_type=code` +
		`&redirect_uri=${encodeURIComponent(redirectURL)}` +
		`&scope=read+write` +
		`&state=${state}`;

	try {
		const responseUrl = await browser.identity.launchWebAuthFlow({
			url: authUrl,
			interactive: true,
		});

		const url = new URL(responseUrl);
		const code = url.searchParams.get("code");
		const returnedState = url.searchParams.get("state");

		if (!validateState(state, returnedState)) {
			throw new Error("Stateが一致しません");
		}

		return await exchangeCodeForToken(code);
	} catch (error) {
		console.error("OAuthエラー:", error);
		return false;
	}
}

/**
 * d-Recordのサーバーにリクエストを送信
 */
async function exchangeCodeForToken(code: string | null) {
	try {
		const response = await fetch(`${WORKER_URL}/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				code,
				redirect_uri: browser.identity.getRedirectURL(),
			}),
		});

		if (!response.ok) {
			throw new Error(`サーバーエラー: ${response.status}`);
		}

		const { access_token } = await response.json();
		await Promise.all([
			storage.setItem("local:Token", access_token),
			storage.setMeta("local:Token", { oauth: true }),
		]);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
