import React from 'react';
import ReachTooltip from '@reach/tooltip';
import '@reach/tooltip/styles.css';

export default function Tooltip({ children, ...otherProps }) {
  return <ReachTooltip {...otherProps}>{children}</ReachTooltip>;
}
