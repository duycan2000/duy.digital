import type { Block, CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { deployAfterChange, deployAfterDelete } from '../hooks/triggerDeploy'

const cta = [
  { name: 'label', type: 'text', localized: true },
  { name: 'href', type: 'text' },
] as const

/* ---- Layout blocks (rendered by Astro components with the same slug) ---- */
const Hero: Block = {
  slug: 'hero',
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'highlight', type: 'text', localized: true, admin: { description: 'Phần chữ nghiêng màu Clay' } },
    { name: 'subheading', type: 'textarea', localized: true },
    { name: 'primaryCta', type: 'group', fields: [...cta] as any },
    { name: 'secondaryCta', type: 'group', fields: [...cta] as any },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true, maxRows: 2 },
  ],
}
const Content: Block = { slug: 'content', fields: [{ name: 'body', type: 'richText', localized: true }] }
const Features: Block = {
  slug: 'features',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'items', type: 'array', fields: [{ name: 'icon', type: 'text' }, { name: 'title', type: 'text', localized: true }, { name: 'text', type: 'textarea', localized: true }] },
  ],
}
const Pricing: Block = {
  slug: 'pricing',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'plans',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', localized: true },
        { name: 'price', type: 'text', admin: { description: 'e.g. A$1,490 or €990' } },
        { name: 'period', type: 'text', localized: true, admin: { description: 'one-off / per month' } },
        { name: 'features', type: 'text', hasMany: true, localized: true },
        { name: 'highlighted', type: 'checkbox' },
        { name: 'ctaHref', type: 'text' },
      ],
    },
  ],
}
const ProjectsGrid: Block = {
  slug: 'projectsGrid',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'source', type: 'select', defaultValue: 'featured', options: ['featured', 'industry', 'manual'] },
    { name: 'industry', type: 'text', admin: { condition: (_, s) => s?.source === 'industry' } },
    { name: 'projects', type: 'relationship', relationTo: 'projects', hasMany: true, admin: { condition: (_, s) => s?.source === 'manual' } },
    { name: 'limit', type: 'number', defaultValue: 6 },
  ],
}
const FAQ: Block = {
  slug: 'faq',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'items', type: 'array', fields: [{ name: 'question', type: 'text', localized: true }, { name: 'answer', type: 'textarea', localized: true }] },
  ],
}
const Testimonials: Block = {
  slug: 'testimonials',
  fields: [{ name: 'items', type: 'array', fields: [{ name: 'quote', type: 'textarea', localized: true }, { name: 'author', type: 'text' }, { name: 'role', type: 'text' }, { name: 'project', type: 'relationship', relationTo: 'projects' }] }],
}
const CTA: Block = {
  slug: 'cta',
  fields: [{ name: 'heading', type: 'text', localized: true }, { name: 'text', type: 'textarea', localized: true }, { name: 'button', type: 'group', fields: [...cta] as any }],
}
const ContactForm: Block = {
  slug: 'contactForm',
  fields: [{ name: 'heading', type: 'text', localized: true }, { name: 'defaultService', type: 'text' }],
}
const LatestPosts: Block = {
  slug: 'latestPosts',
  fields: [{ name: 'heading', type: 'text', localized: true }, { name: 'category', type: 'relationship', relationTo: 'categories' }, { name: 'limit', type: 'number', defaultValue: 3 }],
}

/** Home, About, Services, industry landing pages (/websites-for-tradies …), legal. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'pageType', '_status'], group: 'Content' },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: { afterChange: [deployAfterChange], afterDelete: [deployAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      blocks: [Hero, Content, Features, Pricing, ProjectsGrid, FAQ, Testimonials, CTA, ContactForm, LatestPosts],
    },
    slugField('title'),
    {
      name: 'pageType',
      type: 'select',
      defaultValue: 'page',
      options: ['home', 'page', 'service', 'industry', 'legal'],
      admin: { position: 'sidebar', description: 'service/industry → Service schema' },
    },
    { name: 'focusKeyword', type: 'text', localized: true, admin: { position: 'sidebar' } },
    { name: 'noindex', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
