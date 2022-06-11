<script lang="ts">
	export let mode: 'inline' | 'store' = 'inline'

	export let title: string
</script>

<h1 id={title.toLowerCase()}>
	{title}!!
</h1>

<style>
	h1 {
		display: flex;
		flex-direction: row;
	}
</style>
