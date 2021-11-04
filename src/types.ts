export type MatchPosition = {
	start: number;
	end: number;
};

export type Match = {
	href: string;
	title: string;
	content: string;
	matchesOnTitle: MatchPosition[] | null;
	matchesOnContent: MatchPosition[] | null;
};
