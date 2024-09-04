import React from 'react';

export interface Props extends React.HTMLAttributes<HTMLElement> {
  leftWidth?: string | number;
  rightWidth?: string | number;
  label?: string;
}

export default function HorizontalFormItem({
  leftWidth = '35%',
  rightWidth = '65%',
  label,
  children,
}: Props) {
  return (
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start' }}>
      <div
        style={{
          flexBasis: leftWidth,
          marginRight: 16,
          marginTop: 4,
          textAlign: 'left',
        }}
      >
        <label htmlFor={label}>{label}</label>
      </div>
      <div style={{ flexBasis: rightWidth }}>{children}</div>
    </div>
  );
}
