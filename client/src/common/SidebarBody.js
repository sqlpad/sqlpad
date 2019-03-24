import React from 'react';

export default function SidebarBody({ children }) {
  return (
    <div className="flex-auto pa2 overflow-x-hidden overflow-y-auto">
      {children}
    </div>
  );
}
