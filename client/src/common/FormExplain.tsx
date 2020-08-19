import React from 'react';
import styles from './FormExplain.module.css';

export default function FormExplain({
  children,
}: React.HTMLAttributes<HTMLElement>) {
  return <span className={styles.formExplain}>{children}</span>;
}
