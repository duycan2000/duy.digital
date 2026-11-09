/**
 * Minimal Lexical JSON → HTML serializer (no React needed on the static site).
 * Supports: paragraph, heading, list, quote, link, upload, horizontalrule, text formats.
 * Headings get stable ids for the auto table of contents.
 */
import { mediaUrl } from './cms'
import { slugify } from './slug'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const FORMAT = { bold: 1, italic: 2, strike: 4, underline: 8, code: 16 }

export type TocItem = { id: string; text: string; depth: number }

const textOf = (n: any): string => (n.text ? n.text : (n.children ?? []).map(textOf).join(''))

export function renderRichText(data: any, toc: TocItem[] = []): string {
  const root = data?.root
  if (!root) return ''
  const walk = (n: any): string => {
    const kids = () => (n.children ?? []).map(walk).join('')
    switch (n.type) {
      case 'root':
        return kids()
      case 'text': {
        let t = esc(n.text ?? '')
        const f = n.format ?? 0
        if (f & FORMAT.code) t = `<code>${t}</code>`
        if (f & FORMAT.bold) t = `<strong>${t}</strong>`
        if (f & FORMAT.italic) t = `<em>${t}</em>`
        if (f & FORMAT.underline) t = `<u>${t}</u>`
        if (f & FORMAT.strike) t = `<s>${t}</s>`
        return t
      }
      case 'linebreak':
        return '<br>'
      case 'paragraph':
        return `<p>${kids()}</p>`
      case 'heading': {
        const text = textOf(n)
        const id = slugify(text)
        const depth = Number(String(n.tag).replace('h', ''))
        if (depth === 2 || depth === 3) toc.push({ id, text, depth })
        return `<${n.tag} id="${id}">${kids()}</${n.tag}>`
      }
      case 'quote':
        return `<blockquote>${kids()}</blockquote>`
      case 'list': {
        const tag = n.listType === 'number' ? 'ol' : 'ul'
        return `<${tag}>${kids()}</${tag}>`
      }
      case 'listitem':
        return `<li>${kids()}</li>`
      case 'horizontalrule':
        return '<hr>'
      case 'link':
      case 'autolink': {
        const f = n.fields ?? {}
        let href = f.url ?? n.url ?? '#'
        if (f.linkType === 'internal' && f.doc?.value) {
          const d = f.doc.value
          const prefix = f.doc.relationTo === 'posts' ? '/blog/' : f.doc.relationTo === 'projects' ? '/work/' : '/'
          href = `${prefix}${d.slug ?? ''}`
        }
        const ext = /^https?:\/\//.test(href) && !href.includes('duy.digital')
        const rel = ext ? ' rel="noopener" target="_blank"' : ''
        return `<a href="${esc(href)}"${rel}>${kids()}</a>`
      }
      case 'upload': {
        const v = n.value
        const src = mediaUrl(v)
        if (!src) return ''
        return `<figure><img src="${esc(src)}" alt="${esc(v.alt ?? '')}" loading="lazy" decoding="async"${v.width ? ` width="${v.width}" height="${v.height}"` : ''}>${v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : ''}</figure>`
      }
      default:
        return kids()
    }
  }
  return walk(root)
}
