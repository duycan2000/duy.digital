import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: () => true },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true, admin: { description: 'Bắt buộc – dùng cho SEO & accessibility.' } },
    { name: 'caption', type: 'text', localized: true },
  ],
  upload: {
    // Image resizing (sharp) is not available on Workers; resize happens at the edge
    // via Cloudflare Images / Astro build instead.
    crop: false,
    focalPoint: false,
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4'],
  },
}
