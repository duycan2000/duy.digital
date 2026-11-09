/**
 * POST /api/contact
 * 1. CORS + honeypot + basic validation
 * 2. Verify Cloudflare Turnstile (if secret configured)
 * 3. Save lead into Payload (`leads` collection)
 * 4. Forward JSON to Duy's personal app (webhook) – failures don't block the user
 */
export interface Env {
  ALLOWED_ORIGINS: string
  CMS_URL: string
  TURNSTILE_SECRET?: string
  CMS_API_KEY?: string
  LEAD_WEBHOOK_URL?: string
  LEAD_WEBHOOK_TOKEN?: string
}

type Lead = {
  name: string
  email: string
  website?: string
  service?: string
  budget?: string
  message?: string
  page?: string
  referrer?: string
  company_url?: string // honeypot
  'cf-turnstile-response'?: string
}

const SERVICES = new Set(['website', 'redesign', 'store', 'maintenance', 'it-support', 'other'])
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : undefined)

function cors(req: Request, env: Env) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  return {
    'access-control-allow-origin': allowed.includes(origin) ? origin : allowed[0],
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    vary: 'origin',
  }
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const h = cors(req, env)
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h })
    if (req.method !== 'POST') return json({ error: 'method' }, 405, h)

    let body: Lead
    try {
      body = req.headers.get('content-type')?.includes('json') ? await req.json() : (Object.fromEntries(await req.formData()) as any)
    } catch {
      return json({ error: 'bad_request' }, 400, h)
    }

    // Honeypot: pretend success for bots
    if (body.company_url) return json({ ok: true }, 200, h)

    const lead = {
      name: clip(body.name, 120),
      email: clip(body.email, 200),
      website: clip(body.website, 300),
      service: SERVICES.has(body.service ?? '') ? body.service : 'other',
      budget: clip(body.budget, 120),
      message: clip(body.message, 5000),
    }
    if (!lead.name || !lead.email || !EMAIL.test(lead.email)) return json({ error: 'invalid' }, 422, h)

    if (env.TURNSTILE_SECRET) {
      const token = body['cf-turnstile-response']
      const fd = new FormData()
      fd.append('secret', env.TURNSTILE_SECRET)
      fd.append('response', token ?? '')
      fd.append('remoteip', req.headers.get('cf-connecting-ip') ?? '')
      const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd }).then((r) => r.json<{ success: boolean }>())
      if (!v.success) return json({ error: 'captcha' }, 403, h)
    }

    const source = {
      page: clip(body.page, 300),
      referrer: clip(body.referrer, 300),
      country: (req as any).cf?.country ?? '',
      locale: req.headers.get('accept-language')?.split(',')[0] ?? '',
    }
    const payload = { ...lead, source, status: 'new' }

    const tasks: Promise<unknown>[] = []
    if (env.CMS_API_KEY) {
      tasks.push(
        fetch(`${env.CMS_URL}/api/leads`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', Authorization: `users API-Key ${env.CMS_API_KEY}` },
          body: JSON.stringify(payload),
        }).then((r) => { if (!r.ok) console.error('cms', r.status) }),
      )
    }
    if (env.LEAD_WEBHOOK_URL) {
      tasks.push(
        fetch(env.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(env.LEAD_WEBHOOK_TOKEN ? { Authorization: `Bearer ${env.LEAD_WEBHOOK_TOKEN}` } : {}) },
          body: JSON.stringify({ type: 'lead.created', at: new Date().toISOString(), lead: payload }),
        }).then((r) => { if (!r.ok) console.error('webhook', r.status) }),
      )
    }
    ctx.waitUntil(Promise.allSettled(tasks))
    return json({ ok: true }, 200, h)
  },
}
