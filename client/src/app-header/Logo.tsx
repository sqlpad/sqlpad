import React from 'react';
import styles from './Logo.module.css';

/**
 * A blue block that stretches beyond the padding in AppHeader
 * It could show a logo someday, or maybe be a primary button if it did some action
 */
function Logo() {
  return <div className={styles.logo}>SQLPad</div>;
}

export default Logo;
