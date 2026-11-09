import type { CollectionConfig } from 'payload'

/** Admin users + blog authors (author box / Person schema for E-E-A-T). */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'name', group: 'Settings' },
  auth: { useAPIKey: true },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'jobTitle', type: 'text', localized: true },
    { name: 'bio', type: 'textarea', localized: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'sameAs', type: 'text', hasMany: true, admin: { description: 'LinkedIn, GitHub, Clutch… (Person schema)' } },
  ],
}
