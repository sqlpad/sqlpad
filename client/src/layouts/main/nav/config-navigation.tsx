import React from 'react';
// routes
// components
import SvgColor from '../../../components/svg-color';
import { PATH_APP } from '../../../routes/paths';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

const ICONS = {
  ingest: icon('ic_ingest'),
  storage: icon('ic_storage'),
  transformation: icon('ic_transformation'),
  analytics: icon('ic_analytics'),
  export: icon('ic_export'),

  settings: icon('ic_settings'),
  access: icon('ic_access'),
  logout: icon('ic_logout'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      {
        title: 'ingest',
        path: PATH_APP.ingest,
        icon: ICONS.ingest,
        disabled: true,
      },
      {
        title: 'storage',
        path: PATH_APP.storage,
        icon: ICONS.storage,
        disabled: true,
      },
      {
        title: 'transformation',
        path: PATH_APP.transform,
        icon: ICONS.transformation,
      },
      {
        title: 'analytics',
        path: PATH_APP.analytics,
        icon: ICONS.analytics,
        disabled: true,
      },
      {
        title: 'export',
        path: 'http://localhost:3000/export',
        icon: ICONS.export,
      },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      {
        title: 'settings',
        path: PATH_APP.settings,
        icon: ICONS.settings,
        disabled: true,
      },
      {
        title: 'access',
        path: PATH_APP.access,
        icon: ICONS.access,
        disabled: true,
      },
      { title: 'logout', path: PATH_APP.logout, icon: ICONS.logout },
    ],
  },
];

export default navConfig;
