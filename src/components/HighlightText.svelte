<script lang="ts">
	import { MatchPosition } from '../types';

	export let matches: MatchPosition[];
	export let text: string;

	$: augmentedMatches = getAugmentedMatches(matches);

	const getAugmentedMatches = (
		ms: MatchPosition[]
	): (MatchPosition & { isMatch: boolean })[] => {
		const newAugmentedMatches: (MatchPosition & { isMatch: boolean })[] = [];
		ms.forEach((m, i) => {
			if (i === 0) {
				if (m.start > 0) {
					newAugmentedMatches.push({
						start: 0,
						end: m.start,
						isMatch: false,
					});
				}
			} else {
				const lastMatch = newAugmentedMatches.at(-1);
				if (m.start > lastMatch.end) {
					newAugmentedMatches.push({
						start: lastMatch.end,
						end: m.start,
						isMatch: false,
					});
				}
			}
			newAugmentedMatches.push({
				start: m.start,
				end: m.end + 1,
				isMatch: true,
			});
		});
		const lastMatch = newAugmentedMatches.at(-1);
		if (lastMatch.end < text.length) {
			newAugmentedMatches.push({
				start: lastMatch.end,
				end: text.length,
				isMatch: false,
			});
		}
		return newAugmentedMatches;
	};
</script>

{#each augmentedMatches as match}
	{#if !match.isMatch}
		{text.slice(match.start, match.end)}
	{:else}
		<strong>{text.slice(match.start, match.end)}</strong>
	{/if}
{/each}

<style>
	strong {
		color: var(--color2);
	}
</style>
