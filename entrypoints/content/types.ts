export type Episode = {
	number: number;
	numberText: string;
	id: string;
	annictId: string;
	viewerRecordsCount: number;
};

export type Work = {
	id: string;
	annictId: string;
	viewerStatusState: string;
	title: string;
	episodesCount: number;
	episodes: {
		nodes: Episode[];
	};
};

export type NextEpisode = {
	work: {
		annictId: string;
	};
	nextEpisode: {
		annictId: string;
	};
};

// type SearchWorksAndViewer = {
//     searchWorks: {
//         nodes: Work[];
//     };
//     viewer: {
//        libraryEntries: {
//          nodes: NextEpisode[];
//        }
//     };
// };

export type Settings = {
	Token?: string;
	sendTiming?: string;
	nextEpisodeLine?: boolean;
	recordButton?: boolean;
	animeTitle?: boolean;
	autoChangeStatus?: boolean;
};

export type AnimeData = {
	id: string;
	annictId: string;
	title: string;
	viewerStatusState: string;
	episodes: Episode[] | [];
	nextEpisode: number | undefined; // Episodeのnumber
	currentEpisode: {
		normalized: number | string | undefined;
		raw: number | string | undefined;
	};
};
