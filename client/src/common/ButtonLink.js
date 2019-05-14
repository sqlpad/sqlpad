import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ButtonLink.module.css';
import Tooltip from './Tooltip';

const ICON_SIZE = 20;

const ButtonLink = ({ className, children, icon, tooltip, ...rest }) => {
  const classNames = [styles.btnLink];
  if (className) {
    classNames.push(className);
  }

  const link = (
    <Link className={classNames.join(' ')} {...rest}>
      {icon && React.cloneElement(icon, { size: ICON_SIZE }, null)}
      {children && icon && <span style={{ width: 4 }} />}
      {children}
    </Link>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip}>
        <span>{link}</span>
      </Tooltip>
    );
  }

  return link;
};

export default ButtonLink;
