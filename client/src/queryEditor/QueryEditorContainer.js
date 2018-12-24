import React from 'react'
import AppNav from '../AppNav'
import AppContext from '../containers/AppContext'
import ConnectionsContext from '../containers/ConnectionsContext'
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
