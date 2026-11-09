/** JSON-LD builders (Organization, Person, BlogPosting, FAQPage, Breadcrumb, Service, CreativeWork). */
const SITE = (import.meta.env.SITE_URL ?? 'https://duy.digital').replace(/\/$/, '')

export const organization = (s: any = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE}/#org`,
  name: s?.siteName ?? 'Duy Digital',
  url: SITE,
  email: s?.email,
  address: { '@type': 'PostalAddress', addressLocality: s?.organization?.city ?? 'Da Nang', addressCountry: s?.organization?.country ?? 'VN' },
  areaServed: (s?.organization?.areaServed ?? ['AU', 'NZ', 'DE', 'US', 'CA']).map((c: string) => ({ '@type': 'Country', name: c })),
  sameAs: (s?.socials ?? []).map((x: any) => x.url).filter(Boolean),
})

export const person = (u: any) =>
  u && {
    '@type': 'Person',
    name: u.name,
    jobTitle: u.jobTitle,
    url: `${SITE}/about`,
    sameAs: u.sameAs ?? [],
  }

export const breadcrumb = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE}${it.url}` })),
})

export const blogPosting = (p: any, url: string, image?: string) => ({
  '@context': 'https://schema.org',
  '@type': p.schemaType ?? 'BlogPosting',
  headline: p.meta?.title ?? p.title,
  description: p.meta?.description ?? p.excerpt,
  image,
  datePublished: p.publishedAt,
  dateModified: p.updatedAt,
  mainEntityOfPage: `${SITE}${url}`,
  author: person(p.author),
  publisher: { '@id': `${SITE}/#org` },
  keywords: [p.focusKeyword, ...(p.secondaryKeywords ?? [])].filter(Boolean).join(', '),
  wordCount: p.seoAnalysis?.wordCount,
})

export const faqPage = (items: { question: string; answer: string }[]) =>
  items?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((q) => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })),
      }
    : null

export const service = (page: any, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: page.title,
  url: `${SITE}${url}`,
  provider: { '@id': `${SITE}/#org` },
  areaServed: ['AU', 'NZ', 'DE', 'US', 'CA'],
})

export const creativeWork = (p: any, url: string, image?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: p.title,
  url: `${SITE}${url}`,
  image,
  creator: { '@id': `${SITE}/#org` },
  about: p.industry,
  dateCreated: p.year ? String(p.year) : undefined,
})
