import React from 'react';
import base from './base.module.css';

const ListItem = ({ children, className, style, ...rest }) => {
  const classNames = [base.borderBottom];
  if (className) {
    classNames.push(className);
  }
  const s = Object.assign(
    {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minHeight: 48
    },
    style
  );
  return (
    <div className={classNames.join(' ')} style={s} {...rest}>
      {children}
    </div>
  );
};

export default ListItem;
