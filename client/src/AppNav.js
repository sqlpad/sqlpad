import Icon from 'antd/lib/icon'
import Layout from 'antd/lib/layout'
import Menu from 'antd/lib/menu'
import Modal from 'antd/lib/modal'
import PropTypes from 'prop-types'
import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import AboutContent from './AboutContent'
import AppContext from './containers/AppContext'
import fetchJson from './utilities/fetch-json.js'

const { Content, Sider } = Layout

class AppNav extends React.Component {
  state = {
    collapsed: true,
    redirect: false
  }

  onCollapse = collapsed => {
    this.setState({ collapsed })
  }

  signout = () => {
    fetchJson('GET', '/api/signout').then(json => {
      this.setState({ redirect: true })
    })
  }

  render() {
    const { redirect } = this.state
    const { pageMenuItems } = this.props

    if (redirect) {
      return <Redirect push to="/signin" />
    }

    return (
      <AppContext.Consumer>
        {appContext => {
          const { currentUser, version } = appContext

          return (
            <Layout style={{ minHeight: '100vh' }}>
              <Sider
                className="overflow-y-scroll"
                collapsible
                collapsed={this.state.collapsed}
                onCollapse={this.onCollapse}
              >
                <div
                  style={{
                    minHeight: '100vh',
                    paddingBottom: '50px',
                    paddingTop: '64px'
                  }}
                  className="flex flex-column justify-between"
                >
                  <Route
                    render={({ history }) => (
                      <Menu theme="dark" selectable={false} mode="inline">
                        <Menu.Item
                          key="queries"
                          onClick={() => {
                            history.push('/queries')
                          }}
                        >
                          <Icon type="file-text" />
                          <span>Queries</span>
                        </Menu.Item>
                        <Menu.Item
                          key="new-query"
                          onClick={() => {
                            history.push('/queries/new')
                          }}
                        >
                          <Icon type="plus" />
                          <span>New Query</span>
                        </Menu.Item>
                        {pageMenuItems}
                      </Menu>
                    )}
                  />
                  <Route
                    render={({ history }) => (
                      <Menu theme="dark" selectable={false} mode="inline">
                        {currentUser.role === 'admin' && (
                          <Menu.Item
                            key="users"
                            onClick={() => {
                              history.push('/users')
                            }}
                          >
                            <Icon type="team" />
                            <span>Users</span>
                          </Menu.Item>
                        )}
                        {currentUser.role === 'admin' && (
                          <Menu.Item
                            key="configuration"
                            onClick={() => {
                              history.push('/config-values')
                            }}
                          >
                            <Icon type="setting" />
                            <span>Configuration</span>
                          </Menu.Item>
                        )}
                        {version && version.updateAvailable && (
                          <Menu.Item
                            key="update"
                            onClick={() => {
                              Modal.info({
                                title:
                                  'Update Available (' +
                                  version.updateType +
                                  ')',
                                maskClosable: true,
                                content: (
                                  <div>
                                    Installed Version: {version.current}
                                    <br />
                                    Latest: {version.latest}
                                  </div>
                                ),
                                onOk() {}
                              })
                            }}
                          >
                            <Icon type="exclamation-circle-o" />
                            <span>Update available</span>
                          </Menu.Item>
                        )}
                        <Menu.Item
                          key="about"
                          onClick={() => {
                            Modal.info({
                              width: 650,
                              title: 'About SQLPad',
                              maskClosable: true,
                              content: (
                                <AboutContent
                                  version={version && version.current}
                                />
                              ),
                              onOk() {}
                            })
                          }}
                        >
                          <Icon type="question-circle-o" />
                          <span>About</span>
                        </Menu.Item>
                        <Menu.Item key="signout" onClick={this.signout}>
                          <Icon type="logout" />
                          <span>Sign out</span>
                        </Menu.Item>
                      </Menu>
                    )}
                  />
                </div>
              </Sider>
              <Layout className="flex w-100 bg-white">
                <Content className="flex w-100">{this.props.children}</Content>
              </Layout>
            </Layout>
          )
        }}
      </AppContext.Consumer>
    )
  }
}

AppNav.propTypes = {
  pageMenuItems: PropTypes.arrayOf(PropTypes.node)
}

export default AppNav
