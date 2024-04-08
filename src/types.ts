export interface Episode {
    number: number;
    numberText: string;
    id: string;
    annictId: string;
    viewerRecordsCount: number;
}

export interface Work {
    id: string;
    annictId: string;
    viewerStatusState: string;
    title: string;
    episodesCount: number;
    episodes: {
        nodes: Episode[];
    };
}

export interface NextEpisode {
    work: {
        annictId: string;
    };
    nextEpisode: {
        annictId: string;
    };
}

// interface SearchWorksAndViewer {
//     searchWorks: {
//         nodes: Work[];
//     };
//     viewer: {
//         nodes: NextEpisode[];
//     };
// }
