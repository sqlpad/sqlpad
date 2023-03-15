import localforage from 'localforage';
import './css/reset.css';
import '@reach/dialog/styles.css';
import '@reach/menu-button/styles.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { SWRConfig } from 'swr';
import { MessageDisplayer } from './common/message';
import './css/index.css';
import './css/react-split-pane.css';
import './css/vendorOverrides.css';
import Routes from './Routes';
import swrFetcher from './utilities/swr-fetcher';
import { SettingsProvider, ThemeSettings } from "./components/settings"
import ThemeProvider from "./theme";

declare global {
  interface Window {
    localforage: LocalForage;
  }
}

window.localforage = localforage;

ReactDOM.render(
  <SWRConfig
    value={{
      fetcher: swrFetcher,
    }}
  >
      <ThemeProvider>
          <ThemeSettings>
              <Routes />
          </ThemeSettings>
      </ThemeProvider>
    <MessageDisplayer />
  </SWRConfig>,
  document.getElementById('root')
);
