<script lang="ts">
	import { session } from '$app/stores'

	export let mode: 'inline' | 'store' = $session?.mode || 'inline'
	export let title: string

	function setMode(val: typeof mode) {
		fetch('/setMode', {
			method: 'POST',
			body: JSON.stringify({
				mode: val
			})
		})

		$session.mode = val
	}
</script>

<h1 id={title.toLowerCase()}>
	{#if mode === 'store'}
		{title} Store
	{:else}
		Inline {title}
	{/if}

	<fieldset>
		<legend style="display: none;">Your favourite fruit?</legend>
		<label>
			<input
				type="radio"
				name="mode"
				value="inline"
				bind:group={mode}
				on:click={() => setMode('inline')}
			/>
			<span class="mode-value">Inline</span>
		</label>
		<label>
			<input
				type="radio"
				name="mode"
				value="store"
				bind:group={mode}
				on:click={() => setMode('store')}
			/>
			<span class="mode-value">Store</span>
		</label>
	</fieldset>
</h1>

<style>
	h1 {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	input {
		display: none;
	}

	.mode-value {
		cursor: pointer;
		font-size: 24px;
		border-radius: 12px;
		padding: 3px 20px;
	}

	input:checked ~ .mode-value {
		background-color: #ff3e00;
		color: #ffe7df;
	}
</style>
