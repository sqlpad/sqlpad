import React from 'react'

const ConnectionsContext = React.createContext({
  connections: [],
  lastUpdated: null,
  loading: false,
  loadingError: null,
  setConnections: () => {},
  deleteConnection: () => {},
  addUpdateConnection: () => {},
  loadConnections: () => {}
})

export default ConnectionsContext
