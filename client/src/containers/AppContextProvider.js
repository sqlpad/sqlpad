import React from 'react';
import fetchJson from '../utilities/fetch-json.js';
import AppContext from './AppContext';

export class AppContextProvider extends React.Component {
  constructor() {
    super();
    this.state = {
      refreshAppContext: async () => {
        const json = await fetchJson('GET', 'api/app');
        // Assign config.baseUrl to global
        // It doesn't change and is needed for fetch requests
        // This allows us to simplify the fetch() call
        if (!json.config) {
          return;
        }
        window.BASE_URL = json.config.baseUrl;
        return this.setState({
          config: json.config,
          smtpConfigured: json.smtpConfigured,
          googleAuthConfigured: json.googleAuthConfigured,
          currentUser: json.currentUser,
          passport: json.passport,
          adminRegistrationOpen: json.adminRegistrationOpen,
          version: json.version
        });
      }
    };
  }

  componentDidMount() {
    this.state.refreshAppContext();
  }

  render() {
    const { config } = this.state;

    // Don't render children until config is sorted out
    return (
      <AppContext.Provider value={this.state}>
        {config ? this.props.children : null}
      </AppContext.Provider>
    );
  }
}

export default AppContextProvider;
