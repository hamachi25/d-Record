const endpoint = 'https://api.annict.com/graphql';
export async function fetchData(query: string): Promise<Response> {
    // async・awaitだとなぜかエラー起きたので、promiseを使う
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('Token', (items: { [key: string]: any }) => {
            const token = items['Token'];

            if (token) {
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: query
                })
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                });
            } else {
                reject(new Error("トークンがありません"));
            }
        });
    });
}

