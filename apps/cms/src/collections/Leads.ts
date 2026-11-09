import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/**
 * Contact-form submissions. Written by the `contact` Worker using an API key
 * (users collection has useAPIKey). Also forwarded to Duy's personal app via webhook.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'service', 'budget', 'status', 'createdAt'],
    group: 'Sales',
  },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'text' },
    { name: 'website', type: 'text' },
    { name: 'service', type: 'select', options: ['website', 'redesign', 'store', 'maintenance', 'it-support', 'other'] },
    { name: 'budget', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'spam'],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'group',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'page', type: 'text' },
        { name: 'referrer', type: 'text' },
        { name: 'utm', type: 'text' },
        { name: 'country', type: 'text' },
        { name: 'locale', type: 'text' },
      ],
    },
  ],
  timestamps: true,
}
