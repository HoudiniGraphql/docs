import { docs } from '../../cache/data';
import Fuse from 'fuse.js';
import { Match, MatchPosition } from '../../types';

const getMatches = (
	query: string,
	matches: readonly Fuse.RangeTuple[]
): MatchPosition[] | null => {
	const MIN_MATCH_LENGTH = Math.max(Math.round((query.length * 2) / 3), 3);

	const result: MatchPosition[] = [];

	matches.forEach((m) => {
		if (m[1] - m[0] > MIN_MATCH_LENGTH) {
			result.push({ start: m[0], end: m[1] });
		}
	});
	return result.length > 0 ? result : null;
};

const fuse = new Fuse(docs, {
	keys: ['title', 'content'],
	includeScore: true,
	includeMatches: true,
	ignoreLocation: true,
	minMatchCharLength: 2,
	threshold: 0.3,
});

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ query }) {
	const queryString = query.get('q');

	let result = fuse.search(queryString);
	result = result.filter((r) => r.score < 0.6);
	const matches: Match[] = [];

	for (let r of result) {
		const content = r.item.content;
		let matchesOnTitle: MatchPosition[] | null = null;
		let matchesOnContent: MatchPosition[] | null = null;
		if (r.matches.length === 0) continue;

		// Do the first matches
		const firstMatches = r.matches[0];
		const firstKey = firstMatches.key;
		if (firstKey == null) continue;
		if (firstKey === 'content') {
			matchesOnContent = getMatches(queryString, firstMatches.indices);
		} else if (firstKey === 'title') {
			matchesOnTitle = getMatches(queryString, firstMatches.indices);
		}

		// Now the second matches
		if (r.matches.length > 1) {
			const secondMatches = r.matches[1];
			const secondKey = secondMatches.key;
			if (secondKey) {
				if (secondKey === 'content') {
					matchesOnContent = getMatches(queryString, secondMatches.indices);
				} else if (secondKey === 'title') {
					matchesOnTitle = getMatches(queryString, secondMatches.indices);
				}
			}
		}

		matches.push({
			href: r.item.href,
			title: r.item.title,
			content,
			matchesOnTitle,
			matchesOnContent,
		});
	}

	return {
		status: 200,
		body: {
			matches,
		},
		headers: {
			'Content-Type': 'application/json',
		},
	};
}
