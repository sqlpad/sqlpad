import 'antd/dist/antd.css';
import 'tachyons/css/tachyons.min.css';
import './css/index.css';
import './css/react-split-pane.css';
import './css/vendorOverrides.css';
import React from 'react';
import ReactDOM from 'react-dom';
import message from 'antd/lib/message';
import Routes from './Routes';
import AppContextStore from './stores/AppContextStore';
import ConnectionsStore from './stores/ConnectionsStore';

// Configure message notification globally
message.config({
  top: 60,
  duration: 2,
  maxCount: 3
});

ReactDOM.render(
  <AppContextStore>
    <ConnectionsStore>
      <Routes />
    </ConnectionsStore>
  </AppContextStore>,
  document.getElementById('root')
);
