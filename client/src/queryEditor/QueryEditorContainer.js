import Icon from 'antd/lib/icon'
import Menu from 'antd/lib/menu'
import React from 'react'
import AppNav from '../AppNav'
import ConnectionListDrawer from '../connections/ConnectionListDrawer'
import { ConnectionsContext } from '../connections/ConnectionsStore'
import AppContext from '../containers/AppContext'
import QueryEditor from './QueryEditor'

class QueryEditorContainer extends React.Component {
  state = {
    visible: false
  }
  render() {
    return (
      <AppNav
        pageMenuItems={[
          <Menu.Item
            key="connections-drawer"
            onClick={() => this.setState({ visible: true })}
          >
            <Icon type="database" />
            <span>DB connections</span>
          </Menu.Item>
        ]}
      >
        <AppContext.Consumer>
          {appContext => (
            <ConnectionsContext.Consumer>
              {connectionsContext => (
                <QueryEditor
                  connections={connectionsContext.connections}
                  loadConnections={connectionsContext.loadConnections}
                  selectedConnectionId={connectionsContext.selectedConnectionId}
                  selectConnection={connectionsContext.selectConnection}
                  {...appContext}
                  {...this.props}
                />
              )}
            </ConnectionsContext.Consumer>
          )}
        </AppContext.Consumer>
        <ConnectionListDrawer
          visible={this.state.visible}
          onClose={() => this.setState({ visible: false })}
        />
      </AppNav>
    )
  }
}

export default QueryEditorContainer
