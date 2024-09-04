import React from 'react';
import { Tooltip as ReachTooltip } from '@reach/tooltip';
import '@reach/tooltip/styles.css';

export interface Props extends React.HTMLAttributes<HTMLElement> {
  label: string;
}

export default function Tooltip({ children, ...otherProps }: Props) {
  return <ReachTooltip {...otherProps}>{children}</ReachTooltip>;
}
