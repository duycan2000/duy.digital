import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { slugField } from '../fields/slug'

/** Blog topic clusters (e.g. "Website cost", "Small business IT"). Each can point at its pillar post. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'pillar', type: 'relationship', relationTo: 'posts', admin: { description: 'Pillar post of this cluster' } },
    slugField('title'),
  ],
}
