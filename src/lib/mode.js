import { session } from '$app/stores'
import { derived } from 'svelte/store'

export default derived([session], ([$session]) => $session?.mode || 'inline')
