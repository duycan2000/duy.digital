/**
 * Build-time client for Payload's REST API.
 * The site is fully static: every page is generated at `astro build`,
 * and Payload triggers a rebuild (deploy hook) whenever content is published.
 */
const CMS_URL = (import.meta.env.CMS_URL ?? process.env.CMS_URL ?? '').replace(/\/$/, '')
const API_KEY = import.meta.env.CMS_API_KEY ?? process.env.CMS_API_KEY

export type Locale = 'en' | 'de' | 'vi'

type Query = Record<string, string | number | boolean | undefined>

async function get<T>(path: string, query: Query = {}): Promise<T | null> {
  if (!CMS_URL) {
    console.warn(`[cms] CMS_URL not set – skipping ${path}`)
    return null
  }
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined) qs.set(k, String(v))
  const res = await fetch(`${CMS_URL}/api/${path}?${qs}`, {
    headers: API_KEY ? { Authorization: `users API-Key ${API_KEY}` } : {},
  })
  if (!res.ok) {
    console.warn(`[cms] ${res.status} ${path}`)
    return null
  }
  return (await res.json()) as T
}

type List<T> = { docs: T[]; totalDocs: number }
const published = { 'where[_status][equals]': 'published' }

export const cms = {
  async all<T = any>(collection: string, locale: Locale = 'en', extra: Query = {}): Promise<T[]> {
    const r = await get<List<T>>(collection, { limit: 500, depth: 2, locale, ...published, ...extra })
    return r?.docs ?? []
  },
  async bySlug<T = any>(collection: string, slug: string, locale: Locale = 'en'): Promise<T | null> {
    const r = await get<List<T>>(collection, { 'where[slug][equals]': slug, limit: 1, depth: 2, locale, ...published })
    return r?.docs?.[0] ?? null
  },
  async global<T = any>(slug: string, locale: Locale = 'en'): Promise<T | null> {
    return get<T>(`globals/${slug}`, { depth: 1, locale })
  },
  async redirects(): Promise<{ from: string; to: { url?: string; reference?: any }; type: string }[]> {
    const r = await get<List<any>>('redirects', { limit: 1000, depth: 1 })
    return r?.docs ?? []
  },
}

export const mediaUrl = (m: any): string | undefined => {
  if (!m || typeof m !== 'object') return undefined
  if (!m.url) return undefined
  return m.url.startsWith('http') ? m.url : `${CMS_URL}${m.url}`
}
