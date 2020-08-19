import React, { useState, useEffect } from 'react';
import styles from './message.module.css';
import mitt from 'mitt';

const emitter = mitt();

interface Message {
  message: string;
  type: 'success' | 'error';
}

export function MessageDisplayer() {
  const [messages, setMessages] = useState<Message[]>([]);

  function onMessage(message: Message | undefined) {
    setMessages((messages) => {
      if (message) {
        return [...messages, message];
      }
      return messages;
    });
    setTimeout(() => setMessages((messages) => messages.slice(1)), 3000);
  }

  useEffect(() => {
    emitter.on('message', onMessage);
    return () => emitter.off('message', onMessage);
  }, []);

  if (messages && messages.length > 0) {
    const msg = messages[messages.length - 1];
    const classNames = [styles.message];
    if (msg.type === 'error') {
      classNames.push(styles.error);
    }
    return <div className={classNames.join(' ')}>{msg.message}</div>;
  }

  return null;
}

export default {
  error: function (message: string) {
    emitter.emit('message', { type: 'error', message });
  },
  success: function (message: string) {
    emitter.emit('message', { type: 'success', message });
  },
};
