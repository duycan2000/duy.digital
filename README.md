# duy.digital

Static website for Duy Digital + headless CMS, all on Cloudflare.

```
apps/
  cms/   Payload CMS 3 (Next.js) on Cloudflare Workers · D1 (SQLite) · R2 (media)   → cms.duy.digital
  web/   Astro static site on Workers Static Assets                               → duy.digital
workers/
  contact/  POST /api/contact → Turnstile → Payload `leads` → webhook to personal app
```

## How content flows

1. Edit in Payload admin (`https://cms.duy.digital/admin`) — Pages, Posts, Projects, Categories, Media, Redirects.
2. On publish, Payload calls `DEPLOY_HOOK_URL` (GitHub `repository_dispatch` → `.github/workflows/deploy-web.yml`).
3. Astro rebuilds every page from the REST API and deploys static HTML (~1 min).

## Collections

| Collection | URL | Notes |
|---|---|---|
| `pages` | `/{slug}` | Block layout (hero, features, pricing, projectsGrid, faq, testimonials, cta, contactForm, latestPosts). `pageType` = home / page / service / industry / legal |
| `posts` | `/blog/{slug}` | Rank Math–style SEO: focus keyword, auto score + checklist (`seoAnalysis`), quick answer, key takeaways, FAQ → FAQPage schema, schema type, canonical, noindex, related posts |
| `projects` | `/work/{slug}` | Port of WP `project` CPT + ACF (client, results, solution list, testimonial, gallery, category website/store/agency, market, industry, featured, order) |
| `categories` | — | Topic clusters with pillar post |
| `leads` | admin only | Contact form submissions |
| `redirects` | `_redirects` | 301s from old WordPress URLs (generated at build) |

Localization: `en` (default), `de`, `vi`. SEO plugin adds `meta.title/description/image` to pages, posts, projects.

## Local development

```bash
pnpm install
cp apps/cms/.env.example apps/cms/.env      # set PAYLOAD_SECRET
pnpm --filter @duy/cms exec payload migrate # local D1 via wrangler
pnpm dev:cms                                # http://localhost:3000/admin
CMS_URL=http://localhost:3000 pnpm dev:web  # http://localhost:4321
```

After changing collections: `pnpm --filter @duy/cms exec payload migrate:create <name>` and commit the migration.

## One-time Cloudflare setup

```bash
# from apps/cms
npx wrangler d1 create duy-digital            # put database_id into wrangler.jsonc
npx wrangler r2 bucket create duy-digital-media
npx wrangler secret put PAYLOAD_SECRET
npx wrangler secret put DEPLOY_HOOK_URL       # https://api.github.com/repos/<owner>/duy.digital/dispatches
npx wrangler secret put DEPLOY_HOOK_TOKEN     # GitHub fine-grained token (Contents: read/write)

# from workers/contact
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put CMS_API_KEY           # API key of a Payload user (enable on the user)
npx wrangler secret put LEAD_WEBHOOK_URL
npx wrangler secret put LEAD_WEBHOOK_TOKEN
```

GitHub repo settings → Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `PAYLOAD_SECRET`.
Variables: `CMS_URL`, `SITE_URL`, `PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_TURNSTILE_SITE_KEY`.

## Roadmap

- [x] Scaffold (CMS schema, Astro routes, SEO/schema, contact worker, CI)
- [ ] Port design 1:1 from the WordPress site (home sections, animations, fonts)
- [ ] Migrate content + media from WordPress, add 301 redirects
- [ ] Deploy to `new.duy.digital` for review → switch DNS
