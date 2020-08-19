import React from 'react';

function InfoBlock({ children }: React.HTMLAttributes<HTMLElement>) {
  return <div className="sp-info-block">{children}</div>;
}

export default InfoBlock;
