import React from 'react';
import styles from './Select.module.css';

export interface Props extends React.HTMLProps<HTMLSelectElement> {
  error?: boolean;
}

export default function Select({ children, error, className, ...rest }: Props) {
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
