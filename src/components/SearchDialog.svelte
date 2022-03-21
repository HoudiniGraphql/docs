<script>
	import { Icon } from '~/components'

	export let setOpen
	export let open
</script>

{#if open}
	<div class="container" on:click={() => setOpen(() => false)} id="search-dialog">
		<div class="body" on:click={(e) => e.stopPropagation()}>
			<input autofocus />
			<Icon name="search" class="search-input-search-icon" />
			<button on:click={() => setOpen(() => false)} class="close-button">
				<Icon name="x" class="search-input-close-icon" />
			</button>
		</div>
	</div>
{/if}

<svelte:window
	on:keydown={(e) => {
		// if the user pressed ctrl+k, open the search dialog
		if (e.key === 'k' && (navigator.platform === 'MacIntel' ? e.metaKey : e.ctrlKey)) {
			e.preventDefault()
			if (document.getElementById('search-dialog')) {
				setOpen(() => false)
			} else {
				setOpen(() => true)
			}
		}

		if (e.code === 'Escape') {
			setOpen(() => false)
		}
	}}
/>

<style>
	.container {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;

		z-index: 20;
		background: rgba(71, 83, 101, 0.5);
		padding-top: 6.25rem;

		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.body {
		background: #161b22;
		max-width: 31.25rem;
		width: calc(100% - 20px);
		border-radius: 11px;
		position: relative;

		box-shadow: 0 5px 20px 20px rgba(22, 27, 34, 0.2);

		min-height: 18.75rem;
	}

	input {
		height: 3.25rem;
		width: 100%;
		border-top-left-radius: 11px;
		border-top-right-radius: 11px;
		border: none;
		box-sizing: border-box;
		padding-left: 3rem;
		padding-right: 3rem;
		outline: none;
		font-size: 1rem;
		line-height: 3.25rem;
		color: #161b22;
	}

	:global(.search-input-search-icon) {
		position: absolute;
		top: calc(1rem + 2px);
		left: 1rem;
		height: 1rem;
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
	}

	:global(.search-input-close-icon) {
		width: 1.25rem !important;
		height: 1.25rem !important;
	}
</style>
