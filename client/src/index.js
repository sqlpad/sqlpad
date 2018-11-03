import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.js'
import { Provider } from 'unstated'
import './css/react-split-pane.css'
import './css/vendorOverrides.css'
import './css/index.css'
import 'tachyons/css/tachyons.min.css'

import 'antd/lib/message/style/css'

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root')
)
