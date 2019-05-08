import React, { useState, useEffect } from 'react';
import mitt from 'mitt';

const emitter = mitt();

export function MessageDisplayer() {
  const [messages, setMessages] = useState([]);

  function onMessage(message) {
    setMessages(messages => [...messages, message]);
    setTimeout(() => setMessages(messages => messages.slice(1)), 3000);
  }

  useEffect(() => {
    emitter.on('message', onMessage);
    return () => emitter.off('message', onMessage);
  }, []);

  if (messages && messages.length > 0) {
    const msg = messages[messages.length - 1];
    return (
      <div
        style={{
          position: 'fixed',
          // TODO better styles
          color: '#FFF',
          backgroundColor: msg.type === 'error' ? 'red' : 'green',
          padding: 8,
          top: 16,
          right: 16,
          width: 200
        }}
      >
        {msg.message}
      </div>
    );
  }

  return null;
}

export default {
  error: function(message) {
    emitter.emit('message', { type: 'error', message });
  },
  success: function(message) {
    emitter.emit('message', { type: 'success', message });
  }
};
