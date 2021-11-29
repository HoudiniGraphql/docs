# Docs

Houdini docs

## Searching

Searching is based on a fuzzy search algorithm in the fuse.js package.

What we do, is in the cache directory, we "scrape" our markdown files for content, and save it in a "cache". Then when the user searches, we fuzzy search the cache.

The cache should be updated whenever there are updates to the docs. You do this by running

```
yarn cache-search
```
