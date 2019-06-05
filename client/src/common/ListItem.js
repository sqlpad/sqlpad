import React from 'react';
import styles from './ListItem.module.css';

const ListItem = ({ children, className, ...rest }) => {
  const classNames = [styles.ListItem];
  if (className) {
    classNames.push(className);
  }

  return (
    <div className={classNames.join(' ')} {...rest}>
      {children}
    </div>
  );
};

export default ListItem;
