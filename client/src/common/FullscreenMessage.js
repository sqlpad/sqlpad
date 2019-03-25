import React from 'react';

export default function FullscreenMessage({ children }) {
  return (
    <div className=" w-100 flex f1 flex-column items-center justify-center">
      {children}
    </div>
  );
}
