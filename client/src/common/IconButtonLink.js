import { Link } from 'react-router-dom';
import React from 'react';

const IconButtonLink = React.forwardRef(({ className, ...rest }, ref) => {
  const cn = 'ant-btn ant-btn-icon-only ' + (className || '');
  return (
    <span ref={ref}>
      <Link className={cn} {...rest} />
    </span>
  );
});

export default IconButtonLink;
