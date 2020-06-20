import mitt from 'mitt';
import React, { useCallback, useContext, useEffect, useState } from 'react';

const Context = React.createContext();

function KeyStateProvider({ children }) {
  const emitter = mitt();
  const state = {};

  const value = {
    state,
    emitter,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useKeyState(key, defaultValue) {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useKeyState must be used within a KeyStateProvider');
  }
  const { state, emitter } = context;

  if (!state[key]) {
    state[key] = defaultValue;
  }

  const [value, setValue] = useState(state[key]);

  useEffect(() => {
    emitter.on(key, setValue);
    return () => emitter.off(key, setValue);
  }, [emitter, key]);

  const setStatemittValue = useCallback(
    (value) => {
      state[key] = value;
      emitter.emit(key, value);
      setValue(value);
    },
    [emitter, state, key]
  );

  return [value, setStatemittValue];
}

export { KeyStateProvider, useKeyState };
