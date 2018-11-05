import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import QueryEditor from './QueryEditor'

function QueryEditorContainer(props) {
  return (
    <Subscribe to={[ConnectionsContainer]}>
      {connectionsContainer => (
        <QueryEditor
          connections={connectionsContainer.state.connections}
          loadConnections={connectionsContainer.loadConnections}
          {...props}
        />
      )}
    </Subscribe>
  )
}

export default QueryEditorContainer
