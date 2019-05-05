import React from 'react';
import ReachTooltip from '@reach/tooltip';
import '@reach/tooltip/styles.css';

export default function Tooltip({ children, label }) {
  return <ReachTooltip label={label}>{children}</ReachTooltip>;
}
