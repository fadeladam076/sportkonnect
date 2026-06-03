import { MeiliSearch } from 'meilisearch'

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_URL!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
})

export const playersIndex = meilisearch.index('players')
export const postsIndex = meilisearch.index('posts')
export const matchesIndex = meilisearch.index('matches')
