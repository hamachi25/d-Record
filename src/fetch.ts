import { settingData } from "./get-local-storage";

const endpoint = "https://api.annict.com/graphql";
export async function fetchData(query: string): Promise<Response> {
    if (settingData.Token) {
        try {
            const response = await fetch(endpoint, {
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
            console.error("ネットワークリクエストエラー:", error);
            throw error;
        }
    } else {
        throw new Error("トークンがありません");
    }
}
