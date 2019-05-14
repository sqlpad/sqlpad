import React from 'react';
import styles from './FormExplain.module.css';

export default function FormExplain({ children }) {
  return <span className={styles.formExplain}>{children}</span>;
}
