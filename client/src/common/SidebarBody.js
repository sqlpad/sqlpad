import React from 'react';

export default function SidebarBody({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
      {children}
    </div>
  );
}
