import type { Access, FieldAccess } from 'payload'

export const authenticated: Access = ({ req }) => Boolean(req.user)
export const anyone: Access = () => true

/** Public can read only published docs; logged-in users see drafts too. */
export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}

export const authenticatedField: FieldAccess = ({ req }) => Boolean(req.user)
