import React from 'react';
import useAppContext from '../utilities/use-app-context';
import styles from './AppHeaderUser.module.css';

function UserButton() {
  const { currentUser } = useAppContext();
  if (!currentUser || currentUser.id === 'noauth') {
    return null;
  }
  return (
    <div className={styles.style}>
      {' '}
      {currentUser?.name || currentUser.email}
    </div>
  );
}

export default React.memo(UserButton);
