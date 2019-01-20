import React from 'react'
import AppNav from '../AppNav'
import { ConnectionsContext } from '../connections/ConnectionsStore'
import AppContext from '../containers/AppContext'
import QueryEditor from './QueryEditor'

function QueryEditorContainer(props) {
  return (
    <AppNav>
      <AppContext.Consumer>
        {appContext => (
          <ConnectionsContext.Consumer>
            {connectionsContext => (
              <QueryEditor
                connections={connectionsContext.connections}
                loadConnections={connectionsContext.loadConnections}
                {...appContext}
                {...props}
              />
            )}
          </ConnectionsContext.Consumer>
        )}
      </AppContext.Consumer>
    </AppNav>
  )
}

export default QueryEditorContainer
