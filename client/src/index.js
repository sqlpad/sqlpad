import './css/reset.css';
import '@reach/dialog/styles.css';
import '@reach/menu-button/styles.css';
import './css/index.css';
import './css/react-split-pane.css';
import './css/vendorOverrides.css';
import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './Routes';
import unistoreStore from './stores/unistoreStore';
import { Provider } from 'unistore/react';
import { MessageDisplayer } from './common/message';

ReactDOM.render(
  <Provider store={unistoreStore}>
    <>
      <Routes />
      <MessageDisplayer />
    </>
  </Provider>,
  document.getElementById('root')
);
