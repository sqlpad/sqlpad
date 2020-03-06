import React from 'react';
import Button from '../../common/Button';
import styles from './LogoButton.module.css';

function LogoButton() {
  return (
    <>
      <Button
        variant="primary"
        onClick={() => {
          // what should this do?
        }}
        className={styles.btn}
      >
        SQLPad
      </Button>
    </>
  );
}

export default React.memo(LogoButton);
