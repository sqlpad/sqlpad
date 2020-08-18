import React from 'react';
import { Link } from 'react-router-dom';
import styles from './IconButton.module.css';
import Tooltip from './Tooltip';

const ICON_SIZE = 18;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  to?: string;
  tooltip?: string;
}

export interface LinkProps extends React.HTMLAttributes<HTMLElement> {
  variant?: string;
  to?: string;
}

export type Ref = HTMLButtonElement;

const IconButton = React.forwardRef<Ref, ButtonProps & LinkProps>(
  (
    { children, variant, to, tooltip, disabled, className, onClick, ...rest },
    ref
  ) => {
    const classNames = [styles.btn];

    if (className) {
      classNames.push(className);
    }

    if (variant === 'danger') {
      classNames.push(styles.danger);
    } else if (variant === 'ghost') {
      classNames.push(styles.ghost);
    }

    let button;

    if (!children) {
      return null;
    }

    // If to is supplied this is a link
    // IMPORTANT: Link is wrapped in <div> to handle tooltip ref passing
    // lineHeight set to initial to fix div/Link being slightly higher than buttons
    if (to && !disabled && !onClick) {
      button = (
        <div style={{ display: 'inline', lineHeight: 'initial' }}>
          <Link to={to} className={classNames.join(' ')} {...rest}>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { size: ICON_SIZE }, null);
              }
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
          onClick={onClick}
          {...rest}
        >
          {React.Children.map(children, (child) => {
            // https://stackoverflow.com/questions/42261783/how-to-assign-the-correct-typing-to-react-cloneelement-when-giving-properties-to
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { size: ICON_SIZE }, null);
            }
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
