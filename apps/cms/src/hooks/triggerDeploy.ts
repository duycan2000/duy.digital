import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Calls DEPLOY_HOOK_URL (GitHub repository_dispatch or any webhook) so the static Astro site
 * is rebuilt whenever published content changes. Awaited directly: timers don't survive
 * the end of a request on Workers. The GitHub workflow uses cancel-in-progress to collapse bursts.
 */

const fire = async (reason: string) => {
  const url = process.env.DEPLOY_HOOK_URL
  if (!url) return
  try {
      const token = process.env.DEPLOY_HOOK_TOKEN
      const isGitHub = url.includes('api.github.com')
      await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(isGitHub ? { Accept: 'application/vnd.github+json', 'User-Agent': 'duy-digital-cms' } : {}),
        },
        // GitHub repository_dispatch → .github/workflows/deploy-web.yml
        body: JSON.stringify(isGitHub ? { event_type: 'cms-publish', client_payload: { reason } } : { reason }),
      })
  } catch (e) {
    console.error('deploy hook failed', e)
  }
}

export const deployAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, collection }) => {
  const now = doc?._status ?? 'published'
  const before = previousDoc?._status
  if (now === 'published' || before === 'published') await fire(`${collection.slug}:${doc.id}`)
  return doc
}

export const deployAfterDelete: CollectionAfterDeleteHook = async ({ doc, collection }) => {
  await fire(`${collection.slug}:${doc?.id}:delete`)
  return doc
}

export const deployGlobal: GlobalAfterChangeHook = async ({ doc, global }) => {
  await fire(`global:${global.slug}`)
  return doc
}
