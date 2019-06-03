import React from 'react';
import { Link } from 'react-router-dom';
import styles from './IconButton.module.css';
import Tooltip from './Tooltip';

const ICON_SIZE = 18;

const IconButton = React.forwardRef(
  (
    { children, type, to, icon, tooltip, disabled, className, ...rest },
    ref
  ) => {
    const classNames = [styles.btn];

    if (className) {
      classNames.push(className);
    }

    if (type === 'danger') {
      classNames.push(styles.danger);
    }

    let button;

    // If to is supplied this is a link
    // IMPORTANT: Link is wrapped in <div> to handle tooltip ref passing
    // lineHeight set to initial to fix div/Link being slightly higher than buttons
    if (to && !disabled) {
      button = (
        <div style={{ display: 'inline', lineHeight: 'initial' }}>
          <Link to={to} className={classNames.join(' ')} {...rest}>
            {React.Children.map(children, child => {
              return React.cloneElement(child, { size: ICON_SIZE }, null);
            })}
          </Link>
        </div>
      );
    } else {
      button = (
        <button
          ref={ref}
          className={classNames.join(' ')}
          disabled={disabled}
          {...rest}
        >
          {React.Children.map(children, child => {
            return React.cloneElement(child, { size: ICON_SIZE }, null);
          })}
        </button>
      );
    }

    // If the button is disabled the tooltip gets weird on hover
    if (!tooltip || disabled) {
      return button;
    }

    return <Tooltip label={tooltip}>{button}</Tooltip>;
  }
);

export default IconButton;
