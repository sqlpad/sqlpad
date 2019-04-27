import React from 'react';

export default function FullscreenMessage({ children }) {
  return (
    <div
      style={{
        fontSize: '3rem',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      {children}
    </div>
  );
}
