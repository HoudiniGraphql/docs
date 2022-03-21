<script>
	import { Icon } from '.'
</script>

<button class="container">
	<div class="column">
		<Icon name="search" strokeWidth="3px" />
		<span> Search </span>
	</div>
	<span class="column" aria-hidden="true"> Ctrl + K </span>
</button>

<style>
	button {
		border: 2px solid #475365;
		color: #475365;
		border-radius: 8px;
		padding: 3px 11px;
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 1rem;
		width: 80%;
		font-size: 16px;
		align-self: center;
		justify-content: space-between;
		background: none;
		cursor: pointer;
		font-family: 'Hind', sans-serif;
	}

	span {
		margin-left: 10px;
		margin-top: 4px;
	}

	.column {
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	button:hover {
		color: #7e90ac;
		border-color: #7e90ac;
	}
</style>
