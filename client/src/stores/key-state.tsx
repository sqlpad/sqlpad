import mitt from 'mitt';
import React, { useCallback, useContext, useEffect, useState } from 'react';

// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
const Context = React.createContext();

function KeyStateProvider({ children }: any) {
  const emitter = mitt();
  const state = {};

  const value = {
    state,
    emitter,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

function useKeyState(key: any, defaultValue: any) {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useKeyState must be used within a KeyStateProvider');
  }
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'state' does not exist on type 'unknown'.
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
