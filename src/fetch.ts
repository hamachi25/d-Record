import { settingData } from "./get-local-storage";

export async function fetchData(query: string): Promise<Response> {
    if (settingData.Token) {
        try {
            const response = await fetch("https://api.annict.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${settingData.Token}`,
                },
                body: query,
            });

            if (!response.ok) {
                throw new Error("ネットワークエラー");
            }

            return response;
        } catch (error) {
            throw new Error();
        }
    } else {
        throw new Error("トークンがありません");
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
        throw new Error();
    }
}
