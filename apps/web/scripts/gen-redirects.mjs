// Writes dist/_redirects from Payload's `redirects` collection (301s from old WordPress URLs).
import { writeFileSync } from 'node:fs'
const CMS = (process.env.CMS_URL || '').replace(/\/$/, '')
const prefix = { posts: '/blog/', projects: '/work/', pages: '/' }
const lines = []
if (CMS) {
  try {
    const r = await fetch(`${CMS}/api/redirects?limit=1000&depth=1`)
    const { docs = [] } = r.ok ? await r.json() : {}
    for (const d of docs) {
      const ref = d.to?.reference
      const to = ref?.value?.slug ? `${prefix[ref.relationTo] ?? '/'}${ref.value.slug}` : d.to?.url
      if (d.from && to) lines.push(`${d.from} ${to} ${d.type === '302' ? 302 : 301}`)
    }
  } catch (e) {
    console.warn('[redirects] CMS unreachable', e.message)
  }
}
// Legacy WordPress paths
lines.push('/feed /blog 301', '/wp-admin/* / 301', '/wp-login.php / 301', '/case-study / 301', '/sample-page / 301')
writeFileSync('dist/_redirects', lines.join('\n') + '\n')
console.log(`[redirects] wrote ${lines.length} rules`)
