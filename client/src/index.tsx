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

ReactDOM.render(
  <SWRConfig
    value={{
      fetcher: swrFetcher,
    }}
  >
    <Routes />
    <MessageDisplayer />
  </SWRConfig>,
  document.getElementById('root')
);
