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
