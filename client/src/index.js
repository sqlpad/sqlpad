import './css/reset.css';
import '@reach/dialog/styles.css';
import '@reach/menu-button/styles.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { SWRConfig } from 'swr';
import { Provider } from 'unistore/react';
import { MessageDisplayer } from './common/message';
import './css/index.css';
import './css/react-split-pane.css';
import './css/vendorOverrides.css';
import Routes from './Routes';
import unistoreStore from './stores/unistoreStore';
import swrFetcher from './utilities/swr-fetcher';
import { SchemaProvider } from './stores/schema-context';

ReactDOM.render(
  <Provider store={unistoreStore}>
    <SchemaProvider>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
        }}
      >
        <Routes />
        <MessageDisplayer />
      </SWRConfig>
    </SchemaProvider>
  </Provider>,
  document.getElementById('root')
);
