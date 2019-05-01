import React from 'react';
import styles from './Select.module.css';

export default function Select({ children, className, ...rest }) {
  const classNames = [styles.select];

  if (className) {
    classNames.push(className);
  }

  return (
    <select className={classNames.join(' ')} {...rest}>
      {children}
    </select>
  );
}
