import type { GlobalConfig } from 'payload'
import { deployGlobal } from '../hooks/triggerDeploy'

const link = [
  { name: 'label', type: 'text', required: true, localized: true },
  { name: 'href', type: 'text', required: true },
] as const

export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Settings' },
  access: { read: () => true },
  hooks: { afterChange: [deployGlobal] },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Duy Digital' },
    { name: 'siteUrl', type: 'text', defaultValue: 'https://duy.digital' },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'email', type: 'email' },
    { name: 'whatsapp', type: 'text' },
    { name: 'bookingUrl', type: 'text', admin: { description: 'Cal.com / Calendly link for the 15-min call' } },
    { name: 'availability', type: 'text', localized: true, admin: { description: 'e.g. 2 project spots open · Dec 2026' } },
    { name: 'socials', type: 'array', fields: [{ name: 'platform', type: 'text' }, { name: 'url', type: 'text' }] },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    {
      name: 'organization',
      type: 'group',
      admin: { description: 'Organization / LocalBusiness schema' },
      fields: [
        { name: 'legalName', type: 'text' },
        { name: 'city', type: 'text', defaultValue: 'Da Nang' },
        { name: 'country', type: 'text', defaultValue: 'VN' },
        { name: 'areaServed', type: 'text', hasMany: true, defaultValue: ['AU', 'NZ', 'DE', 'US', 'CA'] },
      ],
    },
  ],
}

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: { group: 'Settings' },
  access: { read: () => true },
  hooks: { afterChange: [deployGlobal] },
  fields: [
    { name: 'header', type: 'array', fields: [...link] as any },
    { name: 'headerCta', type: 'group', fields: [...link].map((f) => ({ ...f, required: false })) as any },
    {
      name: 'footerColumns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'links', type: 'array', fields: [...link] as any },
      ],
    },
  ],
}
