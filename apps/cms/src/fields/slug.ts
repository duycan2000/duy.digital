import type { Field, FieldHook } from 'payload'

export const slugify = (val: string): string =>
  val
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)
    const src = data?.[fallback] ?? originalDoc?.[fallback]
    return typeof src === 'string' ? slugify(src) : value
  }

/** URL slug, auto-generated from `fallback` field when left empty. */
export const slugField = (fallback = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: `Để trống sẽ tự tạo từ "${fallback}".`,
  },
  hooks: { beforeValidate: [formatSlug(fallback)] },
})
