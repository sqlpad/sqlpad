import React from 'react';

export default function HorizontalFormItem({
  leftWidth = '35%',
  rightWidth = '65%',
  label,
  children
}) {
  return (
    <div style={{ marginTop: 24, display: 'flex', alignItems: 'center' }}>
      <div style={{ flexBasis: leftWidth, marginRight: 16, textAlign: 'left' }}>
        <label for={label}>{label}</label>
      </div>
      <div style={{ flexBasis: rightWidth }}>{children}</div>
    </div>
  );
}
