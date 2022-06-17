import { session } from '$app/stores'
import { derived } from 'svelte/store'

export function getMode() {
	return derived([session], ([$session]) => $session?.mode || 'inline')
}
