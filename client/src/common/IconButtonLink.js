import { Link } from 'react-router-dom';
import React from 'react';

function IconButtonLink({ className, ...rest }) {
  const cn = 'ant-btn ant-btn-icon-only ' + (className || '');
  return <Link className={cn} {...rest} />;
}

export default IconButtonLink;
