import 'antd/dist/antd.css'
import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import { Provider } from 'unstated'
import App from './App.js'
import AppContextProvider from './containers/AppContextProvider'
import './css/index.css'
import './css/react-split-pane.css'
import './css/vendorOverrides.css'

ReactDOM.render(
  <Provider>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </Provider>,
  document.getElementById('root')
)
