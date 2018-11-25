import React from 'react'
import { Subscribe } from 'unstated'
import AppNav from '../AppNav'
import AppContainer from '../containers/AppContainer'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import QueryEditor from './QueryEditor'

function QueryEditorContainer(props) {
  return (
    <AppNav>
      <Subscribe to={[ConnectionsContainer, AppContainer]}>
        {(connectionsContainer, appContainer) => (
          <QueryEditor
            connections={connectionsContainer.state.connections}
            loadConnections={connectionsContainer.loadConnections}
            {...appContainer.state}
            {...props}
          />
        )}
      </Subscribe>
    </AppNav>
  )
}

export default QueryEditorContainer
