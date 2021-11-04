<script lang="ts">
	import { Match } from '../types';
	import HighlightText from './HighlightText.svelte';
	import { navigating } from '$app/stores';

	let query = '';

	let suggestions: Match[] = [];

	$: if ($navigating) {
		query = '';
		suggestions = [];
	}

	const search = async () => {
		if (query.length < 2) {
			suggestions = [];
			return;
		}

		const res = await fetch(`/api/search?q=${query}`);
		const data = await res.json();
		suggestions = data.matches;
	};
</script>

<svelte:window
	on:click={() => {
		query = '';
		suggestions = [];
	}}
/>

<div class="container">
	<input
		on:click|preventDefault|stopPropagation
		type="text"
		bind:value={query}
		on:input={search}
		placeholder="Search..."
	/>

	{#if suggestions.length > 0}
		<ul class="suggestions" on:click|preventDefault|stopPropagation>
			{#each suggestions as suggestion, i}
				{#if i > 0}
					<hr />
				{/if}
				<li class="suggestion">
					<a
						href="/docs/{suggestion.href}"
						on:click={() => {
							query = '';
							suggestions = [];
						}}
					>
						<h3>
							{#if suggestion.matchesOnTitle}
								<HighlightText
									matches={suggestion.matchesOnTitle}
									text={suggestion.title}
								/>
							{:else}
								{suggestion.title}
							{/if}
						</h3>
						<p class="suggestion-content">
							{#if suggestion.matchesOnContent}
								<HighlightText
									matches={suggestion.matchesOnContent}
									text={suggestion.content}
								/>
							{:else}
								{suggestion.content}
							{/if}
						</p>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.container {
		position: relative;
	}

	input {
		border-radius: 0.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		height: 1.5rem;
		width: 20rem;
		padding: 0.25rem 0.5rem;
	}

	.suggestions {
		position: absolute;
		list-style: none;
		background-color: white;
		border-radius: 0.5rem;
		overflow-y: auto;
		border: 1px solid rgb(177, 173, 173);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		max-height: 80vh;
	}

	.suggestion {
		display: flex;
	}

	.suggestion-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	a {
		padding: 0.5rem 1rem;
		text-decoration: none;
	}

	a:hover {
		background-color: rgb(253, 64, 18, 0.1);
	}

	a * {
		margin: 0;
		padding: 0;
	}

	hr {
		height: 1px;
		width: 100%;
		background-color: rgb(177, 173, 173);
	}
</style>
