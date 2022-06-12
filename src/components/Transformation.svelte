<script>
	import { Icon } from '~/components'
</script>

<div style="display: flex; flex-direction: row; align-items: center; overflow-x: auto;">
	<slot name="from" />
	<p style="margin-left: 10px; margin-right: 10px">
		<Icon name="arrow-right" height="30px" width="30px" />
	</p>
	<slot name="to" />
</div>
