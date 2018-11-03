import React from 'react'
import { Subscribe } from 'unstated'
import ConnectionsContainer from '../containers/connections'
import QueryEditor from './QueryEditor'

function QueryEditorContainer(props) {
  return (
    <Subscribe to={[ConnectionsContainer]}>
      {connections => (
        <QueryEditor
          connections={connections.state.connections}
          loadConnections={connections.loadConnections}
          {...props}
        />
      )}
    </Subscribe>
  )
}

export default QueryEditorContainer
