import React from 'react';
import styles from './Select.module.css';

export default function Select({ children, error, className, ...rest }) {
  const classNames = [styles.select];

  if (className) {
    classNames.push(className);
  }
  if (error) {
    classNames.push(styles.danger);
  }

  return (
    <select className={classNames.join(' ')} {...rest}>
      {children}
    </select>
  );
}
