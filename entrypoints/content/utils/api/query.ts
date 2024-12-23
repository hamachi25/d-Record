export const queryWithEpisodes = `
    query SearchWorks($titles: [String!], $seasons: [String!]) {
        searchWorks(
            titles: $titles,
            seasons: $seasons,
            orderBy: { field: CREATED_AT, direction: ASC }
        ) {
            nodes {
                id
                annictId
                viewerStatusState
                title
                media
                episodesCount
                episodes (
                    orderBy: { field: SORT_NUMBER, direction: ASC }
                ) {
                    nodes {
                        number
                        numberText
                        id
                        annictId
                        viewerRecordsCount
                    }
                }
            }
        }
        viewer {
            libraryEntries (
                seasons: $seasons
            ) {
                nodes {
                    work {
                        annictId
                    }
                    nextEpisode {
                        annictId
                    }
                }
            }
        }
    }
`;

export const queryWithAnnictId = `
    query SearchWorks($annictIds: [Int!], $seasons: [String!]) {
        searchWorks(
            annictIds: $annictIds,
            orderBy: { field: CREATED_AT, direction: ASC }
        ) {
            nodes {
                id
                annictId
                viewerStatusState
                title
                media
                episodesCount
                episodes (
                    orderBy: { field: SORT_NUMBER, direction: ASC }
                ) {
                    nodes {
                        number
                        numberText
                        id
                        annictId
                        viewerRecordsCount
                    }
                }
            }
        }
        viewer {
            libraryEntries (
                seasons: $seasons
            ) {
                nodes {
                    work {
                        annictId
                    }
                    nextEpisode {
                        annictId
                    }
                }
            }
        }
    }
`;
