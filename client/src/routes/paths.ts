// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOT = '/';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  logout: path(ROOTS_AUTH, '/logout'),
  signup: path(ROOTS_AUTH, '/signup'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
  newPassword: path(ROOTS_AUTH, '/new-password'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  page403: '/403',
  page404: '/404',
  page500: '/500',
};

export const PATH_APP = {
  root: ROOT,
  ingest: path(ROOT, 'ingest'),
  transform: path(ROOT, 'transform'),
  storage: path(ROOT, 'storage'),
  analytics: path(ROOT, 'analytics'),
  export: path(ROOT, 'export'),
  settings: path(ROOT, 'settings'),
  access: path(ROOT, 'access'),
  logout: path(ROOT, 'auth/logout'),
};
