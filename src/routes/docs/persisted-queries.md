---
title: Persisted Queries
description: How to handle persisted queries in Houdini Graphql
---

# 🚦&nbsp;&nbsp;Persisted Queries

Sometimes you want to confine an API to only fire a set of pre-defined queries. This
can be useful to not only reduce the amount of information transferred over the write
but also act as a list of approved queries, providing additional security. Regardless of
your motivation, the approach involves associating a known string with a particular query
and sending that string to the server instead of the full query body. To support this,
houdini passes a queries hash to the fetch function for you to use.

### Automatic Persisted Queries

An approach to Persisted Queries, popularized by Apollo, is known as
[Automatic Persisted Queries](https://www.apollographql.com/docs/apollo-server/performance/apq/).
This involves first sending a queries hash and if its unrecognized, sending the full
query string. This might look something like:

```typescript
/// src/environment.ts

// This sends the actual fetch request to the server
async function sendFetch({ text, variables, hash }) {
	const result = await this.fetch('localhost:4000/graphql', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: text ? text : undefined,
			variables,
			extensions: {
				persistedQuery: {
					version: 1,
					sha256Hash: hash,
				},
			},
		}),
	});

	return result.json();
}

export default new Environment(async function ({ text, variables = {}, hash }) {
	// first send the request without the text, only the hash
	const response = await sendFetch.call(this, { variables, hash, text: null });

	// if there were no errors, we're good to go
	if (!response.errors) {
		return response;
	}

	// there were errors, send the hash and the query to associate the two for
	// future requests
	return await sendFetch.call(this, { variables, hash, text });
});
```

### Fixed List of Persisted Queries

If you don't want the flexibility of Automatic Persisted Queries, you will need
a fixed association of hash to query for every document that your client will send.
To support this, you can pass the `--persist-output` flag to the `generate` command
and provide a path to save the map:

```bash
npx houdini generate --persist-output ./path/to/persisted-queries.json
# or
npx houdini generate -po ./path/to/persisted-queries.json
```

Once this map has been created, you will have to make it available to your server.

Now, instead of sending the full operation text with every request, you can now simply
pass the hash under whatever field name you prefer:

```typescript
/// src/environment.ts

export default new Environment(async function ({ text, variables = {}, hash }) {
	const result = await this.fetch('http://localhost:4000', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			doc_id: hash,
			variables,
		}),
	});

	// parse the result as json
	return await result.json();
});
```
