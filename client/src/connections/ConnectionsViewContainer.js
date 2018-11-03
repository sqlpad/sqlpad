import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/connections'
import ConnectionsView from './ConnectionsView'

function ConnectionsViewContainer(props) {
  return (
    <Subscribe to={[ConnectionsContainer]}>
      {connections => (
        <ConnectionsView
          connections={connections.state.connections}
          saving={connections.state.saving}
          savingError={connections.state.savingError}
          loading={connections.state.loading}
          loadingError={connections.state.loadingError}
          loadConnections={connections.loadConnections}
          saveConnection={connections.saveConnection}
          deleteConnection={connections.deleteConnection}
          testConnection={connections.testConnection}
          testing={connections.state.testing}
          testFailed={connections.state.testFailed}
          testSuccess={connections.state.testSuccess}
          {...props}
        />
      )}
    </Subscribe>
  )
}

export default ConnectionsViewContainer
