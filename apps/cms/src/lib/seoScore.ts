/**
 * Rank Math–style on-page SEO checklist, computed on save.
 * Result is stored in `seoAnalysis` (score 0-100 + list of checks).
 */

type LexicalNode = { type?: string; text?: string; tag?: string; url?: string; fields?: any; children?: LexicalNode[] }

export const lexicalToText = (node: any): string => {
  if (!node) return ''
  const root = node.root ?? node
  const walk = (n: LexicalNode): string => {
    if (n.text) return n.text
    const inner = (n.children ?? []).map(walk).join('')
    return ['paragraph', 'heading', 'listitem', 'quote'].includes(n.type ?? '') ? inner + '\n' : inner
  }
  return walk(root).trim()
}

const collect = (node: any, pred: (n: LexicalNode) => boolean, out: LexicalNode[] = []): LexicalNode[] => {
  if (!node) return out
  const n: LexicalNode = node.root ?? node
  if (pred(n)) out.push(n)
  ;(n.children ?? []).forEach((c) => collect(c, pred, out))
  return out
}

export type SeoCheck = { id: string; label: string; pass: boolean; weight: number }

export const analyzeSeo = (input: {
  focusKeyword?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  slug?: string | null
  title?: string | null
  content?: any
  siteHost?: string
  hasImageAlt?: boolean
}) => {
  const kw = (input.focusKeyword ?? '').trim().toLowerCase()
  const text = lexicalToText(input.content)
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const first = words.slice(0, 100).join(' ').toLowerCase()
  const metaTitle = input.metaTitle || input.title || ''
  const metaDesc = input.metaDescription || ''
  const headings = collect(input.content, (n) => n.type === 'heading').map((h) => lexicalToText(h).toLowerCase())
  const links = collect(input.content, (n) => n.type === 'link' || n.type === 'autolink')
  const host = input.siteHost ?? 'duy.digital'
  const internal = links.filter((l) => {
    const u = l.fields?.url ?? l.url ?? ''
    return l.fields?.linkType === 'internal' || u.startsWith('/') || u.includes(host)
  }).length
  const external = links.length - internal
  const kwSlug = kw.replace(/\s+/g, '-')
  const occurrences = kw ? lower.split(kw).length - 1 : 0
  const density = wordCount && kw ? (occurrences * kw.split(' ').length * 100) / wordCount : 0
  const avgSentence = (() => {
    const s = text.split(/[.!?]+/).filter((x) => x.trim().length > 0)
    return s.length ? wordCount / s.length : 0
  })()

  const checks: SeoCheck[] = [
    { id: 'kw-set', label: 'Đã đặt focus keyword', pass: !!kw, weight: 10 },
    { id: 'kw-title', label: 'Keyword có trong SEO title', pass: !!kw && metaTitle.toLowerCase().includes(kw), weight: 12 },
    { id: 'kw-title-start', label: 'Keyword nằm ở đầu title (≤ 30 ký tự đầu)', pass: !!kw && metaTitle.toLowerCase().indexOf(kw) > -1 && metaTitle.toLowerCase().indexOf(kw) < 30, weight: 4 },
    { id: 'kw-desc', label: 'Keyword có trong meta description', pass: !!kw && metaDesc.toLowerCase().includes(kw), weight: 8 },
    { id: 'kw-slug', label: 'Keyword có trong URL (slug)', pass: !!kw && (input.slug ?? '').includes(kwSlug), weight: 8 },
    { id: 'kw-first', label: 'Keyword xuất hiện trong 100 từ đầu', pass: !!kw && first.includes(kw), weight: 8 },
    { id: 'kw-heading', label: 'Keyword có trong ít nhất một H2/H3', pass: !!kw && headings.some((h) => h.includes(kw)), weight: 6 },
    { id: 'kw-density', label: `Mật độ keyword 0.5–2.5% (hiện ${density.toFixed(2)}%)`, pass: density >= 0.5 && density <= 2.5, weight: 6 },
    { id: 'title-len', label: `SEO title 40–60 ký tự (hiện ${metaTitle.length})`, pass: metaTitle.length >= 40 && metaTitle.length <= 60, weight: 6 },
    { id: 'desc-len', label: `Meta description 120–160 ký tự (hiện ${metaDesc.length})`, pass: metaDesc.length >= 120 && metaDesc.length <= 160, weight: 6 },
    { id: 'length', label: `Nội dung ≥ 1.000 từ (hiện ${wordCount})`, pass: wordCount >= 1000, weight: 8 },
    { id: 'internal', label: `Có ≥ 2 internal link (hiện ${internal})`, pass: internal >= 2, weight: 6 },
    { id: 'external', label: `Có ≥ 1 external link (hiện ${external})`, pass: external >= 1, weight: 4 },
    { id: 'img-alt', label: 'Ảnh cover có alt text', pass: !!input.hasImageAlt, weight: 4 },
    { id: 'readability', label: `Câu trung bình ≤ 20 từ (hiện ${avgSentence.toFixed(1)})`, pass: avgSentence > 0 && avgSentence <= 20, weight: 4 },
  ]
  const total = checks.reduce((a, c) => a + c.weight, 0)
  const got = checks.filter((c) => c.pass).reduce((a, c) => a + c.weight, 0)
  return {
    score: Math.round((got / total) * 100),
    wordCount,
    readingTime: Math.max(1, Math.round(wordCount / 220)),
    checks: checks.map(({ id, label, pass }) => ({ id, label, pass })),
  }
}
