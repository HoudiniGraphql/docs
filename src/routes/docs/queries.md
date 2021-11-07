---
title: Queries
description: How to fetch data with queries in Houdini Graphql
---

# Queries

Grabbing data from your API is done with the `query` function:

```svelte
<script lang="ts">
    import { query, graphql, AllItems } from '$houdini'

    // load the items
    const { data } = query<AllItems>(graphql`
        query AllItems {
            items {
                id
                text
            }
        }
    `)
</script>

{#each $data.items as item}
    <div>{item.text}</div>
{/each}
```

The workflow for making a new query is the following

- Write the query, that is `const { data } = query(graphql...`
- Run the compiler, that is `npx houdini generate`, or if the query is new from the backend, run `npx houdini generate --pull-schema` to pull down the most recent schema
- Use the newly generated type, that is `const { data } = query<AllItems>(...`

## Query variables and page data

At the moment, query variables are declared as a function in the module context of your component.
This function must be named after your query. In a SvelteKit project, this function takes the same arguments passed to the `load` function
described in the [SvelteKit](https://kit.svelte.dev/docs#Loading) docs while in a sapper application, it takes the same arguments
that are passed to the `preload` function described in the [Sapper](https://sapper.svelte.dev/docs#Pages)
documentation. Regardless of the framework, you can return
the value from `this.error` and `this.redirect` in order to change the behavior of the response. Here is a
modified example from the [demo](./example):

```svelte
// src/routes/[filter].svelte

<script lang="ts">
    import { query, graphql, AllItems } from '$houdini'

    // load the items
    const { data } = query<AllItems>(graphql`
        query AllItems($completed: Boolean) {
            items(completed: $completed) {
                id
                text
            }
        }
    `)
</script>

<script context="module" lang="ts">
    // This is the function for the AllItems query.
    // Query variable functions must be named <QueryName>Variables.
    export function AllItemsVariables(page): AllItems$input {
        // make sure we recognize the value
        if (!['active', 'completed'].includes(page.params.filter)) {
            return this.error(400, "filter must be one of 'active' or 'completed'")
        }

        return {
            completed: page.params.filter === 'completed',
        }
    }
</script>

{#each $data.items as item}
    <div>{item.text}</div>
{/each}
```

## Loading State

The methods used for tracking the loading state of your queries changes depending
on the context of your component. For queries that live in routes (ie, in
`/src/routes/...`), the actual query happens in a `load` function as described
in [What about load?](#what-about-load)

Because of this, the best way to track
if your query is loading is to use the
[navigating store](https://kit.svelte.dev/docs#modules-$app-stores) exported from `$app/stores`:

```svelte
// src/routes/index.svelte

<script>
    import { query } from '$houdini'
    import { navigating } from '$app/stores'

    const { data } = query(...)
</script>

{#if $navigating}
    loading...
{:else}
    data is loaded!
{/if}
```

However, since queries inside of non-route components (ie, ones that are not defined in `/src/routes/...`)
do not get hoisted to a `load` function, the recommended practice to is use the store returned from
the result of query:

```svelte
// src/components/MyComponent.svelte

<script>
    import { query } from '$houdini'

    const { data, loading } = query(...)
</script>

{#if $loading}
    loading...
{:else}
    data is loaded!
{/if}
```

## Additional logic

Sometimes you will need to add additional logic to a component's query. For example, you might want to
check if the current session is valid before a query is sent to the server. In order to support this,
houdini will look for a function called `onLoad` defined in the module context which can be used to perform
any logic you need. If you return a value from this function, it will be passed as props to your component:

```svelte
<script context="module">
    // It has access to the same arguments and this.error this.redirect as the variable functions
    export function onLoad({page, session}){
        if(!session.authenticated){
            return this.redirect(302, '/login')
        }

	return {
	    message: "There are this many items"
        }
    }
</script>

<script>
    import { query, graphql } from '$houdini'

    export let message

    // load the items
    const { data } = query(graphql`
        query AllItems {
            items {
                id
            }
        }
    `)
</script>

{message}: {$data.items.length}
```

## Refetching Data

Refetching data is done with the `refetch` function provided from the result of a query:

```svelte

<script lang="ts">
    import { query, graphql, AllItems } from '$houdini'

    // load the items
    const { refetch } = query<AllItems>(graphql`
        query AllItems($completed: Boolean) {
            items(completed: $completed) {
                id
                text
            }
        }
    `)

    let completed = true

    $: refetch({ completed })
</script>

<input type=checkbox bind:checked={completed}>
```

### Cache policy

By default, houdini will only try to load queries against its local cache when you indicate it is safe to do so.
This can be done with the `@cache` directive:

```graphql
query AllItems @cache(policy: CacheOrNetwork) {
	items {
		id
		text
	}
}
```

There are 3 different policies that can be specified:

- **CacheOrNetwork** will first check if a query can be resolved from the cache. If it can, it will return the cached value and only send a network request if data was missing.
- **CacheAndNetwork** will use cached data if it exists and always send a network request after the component has mounted to retrieve the latest data from the server
- **NetworkOnly** will never check if the data exists in the cache and always send a network request

#### Data Retention

Houdini will retain a query's data for a configurable number of queries (default 10).
For a concrete example, consider an example app that has 3 routes. If you load one of the
routes and then click between the other two 5 times, the first route's data will still be
resolvable (and the counter will reset if you visit it).
If you then toggle between the other routes 10 times and then try to load the first
route, a network request will be sent. This number is configurable with the
`cacheBufferSize` value in your config file:

```js
// houdini.config.js

export default {
	// ...
	cacheBufferSize: 5,
};
```

#### Changing default cache policy

As previously mentioned, the default cache policy is `CacheOrNetwork`. This can be changed
by setting the `defaultCachePolicy` config value:

```js
// houdini.config.js

import { CachePolicy } from '$houdini';

export default {
	// ...

	// note: if you are upgrading from a previous version of houdini, you might
	// have to generate your runtime for this type to be defined.
	defaultCachePolicy: CachePolicy.NetworkOnly,
};
```

### What about `load`?

Don't worry - that's where the preprocessor comes in. One of its responsibilities is moving the actual
fetch into a `load`. You can think of the block at the top of this section as equivalent to:

```svelte
<script context="module">
    export async function load() {
            return {
                _data: await this.fetch({
                    text: `
                        query AllItems {
                            items {
                                id
                                text
                            }
                        }
                    `
                }),
            }
    }
</script>

<script>
    export let _data

    const data = readable(_data, ...)
</script>

{#each $data.items as item}
    <div>{item.text}</div>
{/each}
```
