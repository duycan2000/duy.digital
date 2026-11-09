import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { slugField } from '../fields/slug'
import { deployAfterChange, deployAfterDelete } from '../hooks/triggerDeploy'

/** Portfolio case studies – replaces the WordPress `project` CPT + ACF group_dd_project. URL: /work/{slug} */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'market', 'featured', 'updatedAt'],
    group: 'Content',
  },
  access: { read: publishedOrAuthenticated, create: authenticated, update: authenticated, delete: authenticated },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: 'order',
  hooks: { afterChange: [deployAfterChange], afterDelete: [deployAfterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            { name: 'client', type: 'text' },
            { name: 'tagline', type: 'text', localized: true, admin: { description: 'One-line summary on cards' } },
            { name: 'excerpt', type: 'textarea', localized: true },
            { name: 'cover', type: 'upload', relationTo: 'media', required: true },
            { name: 'gallery', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }, { name: 'caption', type: 'text', localized: true }] },
            { name: 'liveUrl', type: 'text', admin: { description: 'https://…' } },
          ],
        },
        {
          label: 'Case study',
          fields: [
            { name: 'challenge', type: 'richText', localized: true },
            { name: 'solution', type: 'richText', localized: true },
            { name: 'solutionList', type: 'array', localized: true, labels: { singular: 'Item', plural: 'Solution list' }, fields: [{ name: 'item', type: 'text', required: true }] },
            {
              name: 'results',
              type: 'array',
              labels: { singular: 'Result', plural: 'Results' },
              fields: [
                { name: 'value', type: 'text', required: true, admin: { description: 'e.g. 1.2s, +35%' } },
                { name: 'label', type: 'text', required: true, localized: true },
              ],
            },
            {
              name: 'testimonial',
              type: 'group',
              fields: [
                { name: 'quote', type: 'textarea', localized: true },
                { name: 'author', type: 'text' },
                { name: 'role', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Meta',
          fields: [
            { name: 'services', type: 'select', hasMany: true, options: ['Web design', 'WordPress', 'WooCommerce', 'Shopify', 'Elementor', 'SEO', 'Branding', 'Maintenance', 'IT support'] },
            { name: 'stack', type: 'text', hasMany: true },
            { name: 'industry', type: 'text', admin: { description: 'e.g. Dental, Tradie, Beauty, Hospitality' } },
          ],
        },
      ],
    },
    slugField('title'),
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Online store', value: 'store' },
        { label: 'Agency / white-label', value: 'agency' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'market', type: 'select', options: ['AU', 'NZ', 'DE', 'US', 'CA', 'VN', 'Other'], admin: { position: 'sidebar' } },
    { name: 'year', type: 'number', admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on homepage “Selected work”' } },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}

