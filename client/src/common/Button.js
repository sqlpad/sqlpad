import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  type,
  htmlType,
  className,
  ...rest
}) {
  const classNames = [styles.btn];

  if (type === 'primary') {
    classNames.push(styles.primary);
  } else if (type === 'danger') {
    classNames.push(styles.danger);
  }

  if (className) {
    classNames.push(className);
  }

  return (
    <button className={classNames.join(' ')} type={htmlType} {...rest}>
      {children}
    </button>
  );
}
