import React from 'react';
import styles from './Button.module.css';

export default function Button({ children, type, className, ...rest }) {
  let cs = styles.btn;
  if (type === 'primary') {
    cs += ' ' + styles.primary;
  } else if (type === 'danger') {
    cs += ' ' + styles.danger;
  }
  if (className) {
    cs += ' ' + className;
  }

  return (
    <button className={cs} {...rest}>
      {children}
    </button>
  );
}
