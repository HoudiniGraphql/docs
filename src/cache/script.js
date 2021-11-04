import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

const getDocs = () => {
	const docsDirectory = path.join(process.cwd(), './src/routes/docs');
	const fileNames = fs.readdirSync(docsDirectory);

	// @ts-ignore
	const docs = fileNames.filter((fileName) => !fileName.startsWith('__'));
	let newDocs = [];
	for (const fileName of docs) {
		const id = fileName.replace(/.md$/, '');
		const fullPath = path.join(docsDirectory, fileName);
		const fileContents = fs.readFileSync(fullPath, 'utf8');
		const ast = unified().use(remarkParse).parse(fileContents);

		const ret = [];
		let obj = { href: undefined, title: undefined, content: '' };

		for (let c of ast.children.slice(2)) {
			if (c.type === 'thematicBreak') return;

			if (c.type === 'heading') {
				if (obj.href != null) {
					ret.push(JSON.parse(JSON.stringify(obj)));
					obj = { href: undefined, title: undefined, content: '' };
				}
				const content = c.children.map((cc) => getContent(cc)).join('');
				obj.title = content;
				obj.href = id + '#' + slugger.slug(content);
			} else {
				const content = getContent(c);
				if (content) {
					obj.content += content;
				}
			}
		}
		ret.push(obj);
		newDocs = newDocs.concat(ret);
	}

	console.log(newDocs);

	return JSON.stringify(newDocs);
};

const getContent = (c) => {
	if (c.value) {
		return c.value;
	} else if (c.children) {
		return c.children.map((child) => getContent(child)).join('');
	}

	return '';
};

const fileContents = `export const docs = ${getDocs()}`;

fs.writeFile('src/cache/data.ts', fileContents, (err) => {
	if (err) {
		return console.error(err);
	}
	console.log('Docs cached.');
});
