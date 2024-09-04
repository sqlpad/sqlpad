import React from 'react';

export interface Props {
  size?: number;
}

export default function Spacer({ size = 1 }: Props) {
  return <div style={{ height: size * 8 }} />;
}
