import path from 'path'
import fs from 'fs/promises'
import { compile } from 'mdsvex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { parse, HTMLElement } from 'node-html-parser'

// grab the list of files
export async function loadContent() {
	// the root directory
	const routeDir = path.resolve('src', 'routes')

	// build up an object from every directory in the routeDir
	return (
		await Promise.all(
			(
				await fs.readdir(routeDir)
			).map(async (category) => {
				if (category === 'intro') {
					return []
				}

				const categoryDir = path.join(routeDir, category)
				// if the path is not a directory, ignore it
				if (!(await fs.lstat(categoryDir)).isDirectory()) {
					return []
				}

				const passages = []

				// look at every file in the category directory
				for (const file of await fs.readdir(categoryDir)) {
					// the file's path
					const filepath = path.join(categoryDir, file)

					// open the contents of the file so we can extract the frontmatter
					const contents = await fs.readFile(filepath, 'utf-8')
					const { code } = await compile(contents, {
						rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings]
					})

					// parse the contents so we can extract the various headers
					const parsed = parse(code)

					// walk through all of the contents in order of appearance and split every section of paragraphs into
					// its own document with a breadcrumb of the running headers
					let breadcrumb = []
					let content = ''
					let headerLevel = 0
					for (const tag of parsed.querySelectorAll('h1, h2, h3, p')) {
						// if we ran into a header and there is a content accumulator, add what we have to the list
						if (tag.tagName.startsWith('H') && content) {
							const passage = {
								breadcrumb: [
									category[0].toUpperCase() + category.slice(1),
									...breadcrumb.map((element) => element.text)
								],
								content: content.replace(/\n/g, ' '),
								href: `/${category}/${path.basename(file).split('.')[0]}`
							}

							// if the content is nested under a header
							if (breadcrumb.length > 1) {
								passage.href += `#${breadcrumb[breadcrumb.length - 1].attributes.id}`
							}

							passages.push(passage)

							content = ''
						}

						if (tag.tagName === 'H1') {
							headerLevel = 1
							breadcrumb = [tag]
						}

						if (tag.tagName === 'H2') {
							// there are only two entries in the breadcrumb
							breadcrumb = [breadcrumb[0], tag]
							headerLevel = 2
						}

						if (tag.tagName === 'H3') {
							// if an h3 is inside of an h1, just use that as the breadcrumb
							if (headerLevel === 1) {
								breadcrumb = [breadcrumb[0], tag]
							}

							if (headerLevel === 2) {
								breadcrumb = [breadcrumb[0], breadcrumb[1], tag]
							}
						}

						if (tag.tagName === 'P') {
							content += tag.text + ' '
						}
					}

					if (content) {
						const passage = {
							breadcrumb: [
								category[0].toUpperCase() + category.slice(1),
								...breadcrumb.map((element) => element.text)
							],
							content: content.replace(/\n/g, ' '),
							href: `/${category}/${path.basename(file).split('.')[0]}`
						}

						// if the content is nested under a header
						if (breadcrumb.length > 1) {
							passage.href += `#${breadcrumb[breadcrumb.length - 1].attributes.id}`
						}

						passages.push(passage)

						content = ''
					}
				}

				return passages
			})
		)
	).flat()
}
