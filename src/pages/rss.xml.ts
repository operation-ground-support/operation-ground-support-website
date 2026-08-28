/**
 * RSS for updates. Cheap to provide, and the thing a neighborhood newsletter or a partner
 * congregation can actually subscribe to.
 */
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'
import { org } from '../data/org'

export async function GET(context: APIContext) {
  const posts = (await getCollection('updates', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  )

  return rss({
    title: `${org.name} — Updates`,
    description: org.mission,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/updates/${post.id}`,
    })),
  })
}
