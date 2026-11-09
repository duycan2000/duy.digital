import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { deployAfterChange, deployAfterDelete } from '../hooks/triggerDeploy'
import { analyzeSeo } from '../lib/seoScore'

const computeSeo: CollectionBeforeChangeHook = async ({ data, req }) => {
  let hasImageAlt = false
  if (data.cover) {
    try {
      const id = typeof data.cover === 'object' ? data.cover.id : data.cover
      const m = await req.payload.findByID({ collection: 'media', id, depth: 0, req })
      hasImageAlt = !!m?.alt
    } catch {}
  }
  const r = analyzeSeo({
    focusKeyword: data.focusKeyword,
    metaTitle: data.meta?.title,
    metaDescription: data.meta?.description,
    slug: data.slug,
    title: data.title,
    content: data.content,
    hasImageAlt,
  })
  data.seoAnalysis = r
  data.readingTime = r.readingTime
  if (data._status === 'published' && !data.publishedAt) data.publishedAt = new Date().toISOString()
  return data
}

/** Blog posts with Rank Math–style SEO analysis. URL: /blog/{slug} */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'focusKeyword', 'seoScore', '_status', 'publishedAt'],
    group: 'Content',
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 30 },
  defaultSort: '-publishedAt',
  hooks: { beforeChange: [computeSeo], afterChange: [deployAfterChange], afterDelete: [deployAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'quickAnswer', type: 'textarea', localized: true, admin: { description: '40–60 từ trả lời trực tiếp câu hỏi chính (cho featured snippet / AI Overview).' } },
            { name: 'keyTakeaways', type: 'array', localized: true, maxRows: 6, fields: [{ name: 'point', type: 'text', required: true }] },
            { name: 'content', type: 'richText', localized: true, required: true },
            {
              name: 'faq',
              type: 'array',
              localized: true,
              labels: { singular: 'FAQ', plural: 'FAQ' },
              admin: { description: 'Xuất ra FAQPage schema.' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'focusKeyword', type: 'text', localized: true, admin: { description: 'Từ khoá chính (như Rank Math).' } },
            { name: 'secondaryKeywords', type: 'text', hasMany: true, localized: true },
            {
              name: 'schemaType',
              type: 'select',
              defaultValue: 'BlogPosting',
              options: ['BlogPosting', 'Article', 'HowTo', 'NewsArticle'],
            },
            { name: 'canonical', type: 'text', admin: { description: 'Để trống = URL của bài.' } },
            { name: 'noindex', type: 'checkbox', defaultValue: false },
            {
              name: 'seoAnalysis',
              type: 'json',
              admin: { readOnly: true, description: 'Tự tính khi lưu: điểm 0–100 + checklist.' },
            },
          ],
        },
      ],
    },
    slugField('title'),
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    { name: 'excerpt', type: 'textarea', localized: true, admin: { position: 'sidebar' } },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'relatedPosts', type: 'relationship', relationTo: 'posts', hasMany: true, admin: { position: 'sidebar' }, filterOptions: ({ id }) => ({ id: { not_equals: id } }) },
    { name: 'relatedService', type: 'relationship', relationTo: 'pages', admin: { position: 'sidebar', description: 'Trang dịch vụ để CTA/internal link.' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'readingTime', type: 'number', admin: { position: 'sidebar', readOnly: true } },
    {
      name: 'seoScore',
      type: 'number',
      virtual: true,
      admin: { position: 'sidebar', readOnly: true },
      hooks: { afterRead: [({ siblingData }) => siblingData?.seoAnalysis?.score ?? null] },
    },
  ],
}
