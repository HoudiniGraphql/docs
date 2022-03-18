import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import { mdsvex } from 'mdsvex'
import path from 'path'
import hljs from 'highlight.js'
import hljs_svelte from 'highlightjs-svelte'
import graphqlLang from './src/lib/graphql-language.js'
import { replaceCodePlugin } from 'vite-plugin-replace'
import { loadFiles } from './src/lib/loadFiles.js'

// add svelte syntax highlighting support
hljs_svelte(hljs)

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Pick up both .svelte and .svx files
	extensions: ['.svelte', '.svx'],

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		mdsvex({
			layout: path.resolve('./src/routes/_page.svelte'),
			highlight: {
				highlighter(str, lang) {
					let code = str

					if (lang && hljs.getLanguage(lang)) {
						try {
							code = hljs
								.highlight(str.replace(/\t/g, '    '), {
									language: lang
								})
								.value.replace(/`/g, '&#96;')
								.replace(/{/g, '&#123;')
								.replace(/}/g, '&#125;')
						} catch (__) {}
					}

					return `<pre class="hljs" data-language="${lang}"><code class="hljs">{@html \`${code}\`}</code></pre>`
				}
			}
		}),
		preprocess()
	],

	kit: {
		adapter: adapter(),
		vite: {
			optimizeDeps: {
				include: ['highlight.js/lib/core']
			},
			resolve: {
				alias: {
					// these are the aliases and paths to them
					'~': path.resolve('./src')
				}
			},
			plugins: [
				replaceCodePlugin({
					replacements: [{ from: 'REPLACE_WITH_FILES', to: JSON.stringify(await loadFiles()) }]
				})
			]
		}
	}
}

// add graphql support to highlight js
hljs.registerLanguage('graphql', graphqlLang)

export default config
