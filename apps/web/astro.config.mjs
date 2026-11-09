// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: process.env.SITE_URL || 'https://duy.digital',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  i18n: {
    locales: ['en', 'de', 'vi'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', de: 'de-DE', vi: 'vi-VN' } },
      filter: (page) => !page.includes('/thank-you'),
    }),
  ],
  image: { domains: ['cms.duy.digital'] },
})
