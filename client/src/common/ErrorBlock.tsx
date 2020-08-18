import React from 'react';

function ErrorBlock({ children }: React.HTMLAttributes<HTMLElement>) {
  return <div className="sp-error-block">{children}</div>;
}

export default ErrorBlock;
