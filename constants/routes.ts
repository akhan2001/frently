// Single source of truth for app routes. Functions for parametrized routes
// so callers can't typo a path.

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  LISTINGS: '/listings',
  NEW_LISTING: '/listings/new',
  LISTING: (id: string) => `/listings/${id}`,
  EDIT_LISTING: (id: string) => `/listings/${id}/edit`,
  ADMIN: '/admin',
  ADMIN_LISTINGS: '/admin/listings',
  ADMIN_LISTING: (id: string) => `/admin/listings/${id}`,
} as const;
