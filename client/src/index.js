import 'antd/dist/antd.css';
import 'tachyons/css/tachyons.min.css';
import './css/index.css';
import './css/react-split-pane.css';
import './css/vendorOverrides.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
import AppContextProvider from './containers/AppContextProvider';
import ConnectionsStore from './connections/ConnectionsStore';

ReactDOM.render(
  <AppContextProvider>
    <ConnectionsStore>
      <App />
    </ConnectionsStore>
  </AppContextProvider>,
  document.getElementById('root')
);
