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
    emitter.on('error', onMessage);
    return () => emitter.off('error', onMessage);
  }, []);

  if (messages && messages.length > 0) {
    return (
      <div
        style={{
          position: 'fixed',
          color: '#FFF',
          backgroundColor: '#000',
          padding: 8,
          top: 16,
          right: 16,
          width: 200
        }}
      >
        {messages[messages.length - 1]}
      </div>
    );
  }

  return null;
}

export default {
  error: function(message) {
    emitter.emit('error', message);
  }
};
