import React from 'react';
import styles from './ListItem.module.css';

const ListItem = ({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) => {
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
