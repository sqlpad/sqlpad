import React, { useState, useEffect } from 'react';
import fetchJson from '../utilities/fetch-json.js';

export const AppContext = React.createContext({});

export function AppContextStore({ children }) {
  const [state, setState] = useState({});

  const refreshAppContext = async () => {
    const json = await fetchJson('GET', 'api/app');
    if (!json.config) {
      return;
    }
    // Assign config.baseUrl to global
    // It doesn't change and is needed for fetch requests
    // This allows us to simplify the fetch() call
    window.BASE_URL = json.config.baseUrl;

    // refreshAppContext added to state here to allow children to refresh this
    setState({
      refreshAppContext,
      config: json.config,
      smtpConfigured: json.smtpConfigured,
      googleAuthConfigured: json.googleAuthConfigured,
      currentUser: json.currentUser,
      passport: json.passport,
      adminRegistrationOpen: json.adminRegistrationOpen,
      version: json.version
    });
  };

  useEffect(() => {
    refreshAppContext();
  }, []);

  // Don't render children until config is sorted out
  return (
    <AppContext.Provider value={state}>
      {state.config ? children : null}
    </AppContext.Provider>
  );
}

export default AppContextStore;
