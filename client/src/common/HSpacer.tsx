import React, { CSSProperties } from 'react';

export interface Props {
  size?: number;
  grow?: boolean;
}

function HSpacer({ size = 1, grow = false }: Props) {
  const sizes = [8, 16, 32, 64];
  const width = sizes[size - 1] || 64;

  const style: CSSProperties = {
    width,
  };

  if (grow) {
    style.flexGrow = 1;
  }

  return <div style={style} />;
}

export default HSpacer;
