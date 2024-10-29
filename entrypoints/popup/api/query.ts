export const query = `
    query SearchWorks($titles: [String!]) {
        searchWorks(
            titles: $titles,
            orderBy: { field: SEASON, direction: DESC }
        ) {
            nodes {
                annictId
                title
                media
                seasonYear
                image {
					facebookOgImageUrl
				}
            }
        }
    }
`;

export const queryWithAnnictId = `
    query SearchWorks($annictIds: [Int!]) {
        searchWorks(
            annictIds: $annictIds,
            orderBy: { field: CREATED_AT, direction: ASC }
        ) {
            nodes {
                annictId
                title
                media
                seasonYear
                image {
					facebookOgImageUrl
				}
            }
        }
    }
`;
