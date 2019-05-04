import React from 'react';
import styles from './Input.module.css';

export default function Input({ children, error, className, ...rest }) {
  const classNames = [styles.input];

  if (error) {
    classNames.push(styles.danger);
  }

  if (className) {
    classNames.push(className);
  }

  return (
    <input className={classNames.join(' ')} {...rest}>
      {children}
    </input>
  );
}
