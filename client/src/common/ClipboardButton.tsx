import React from 'react';
import ClipboardIcon from 'mdi-react/ClipboardIcon';
import IconButton from './IconButton';

async function copyToClipboardModern(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export default function ClipboardButton({
  onCopyStart,
}: {
  onCopyStart: () => string;
}) {
  return (
    <IconButton
      tooltip="copy results to clipboard"
      onClick={() => {
        const text = onCopyStart();
        copyToClipboardModern(text);
      }}
    >
      <ClipboardIcon />
    </IconButton>
  );
}
