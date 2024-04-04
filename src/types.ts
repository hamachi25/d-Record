export interface Episode {
    number: number;
    numberText: string;
    id: string;
    annictId: string;
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
