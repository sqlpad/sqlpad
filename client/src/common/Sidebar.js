import React from 'react';

export default function Sidebar({ children }) {
  return (
    <div className="flex flex-column h-100 overflow-x-hidden overflow-y-auto">
      {children}
    </div>
  );
}
