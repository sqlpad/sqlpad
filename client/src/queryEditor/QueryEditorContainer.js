import React from 'react'
import { Subscribe } from 'unstated'
import AppNav from '../AppNav'
import AppContext from '../containers/AppContext'
import ConnectionsContainer from '../containers/ConnectionsContainer'
import QueryEditor from './QueryEditor'

function QueryEditorContainer(props) {
  return (
    <AppNav>
      <AppContext.Consumer>
        {appContext => (
          <Subscribe to={[ConnectionsContainer]}>
            {connectionsContainer => (
              <QueryEditor
                connections={connectionsContainer.state.connections}
                loadConnections={connectionsContainer.loadConnections}
                {...appContext}
                {...props}
              />
            )}
          </Subscribe>
        )}
      </AppContext.Consumer>
    </AppNav>
  )
}

export default QueryEditorContainer
