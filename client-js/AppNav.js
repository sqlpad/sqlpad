import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import fetchJson from './utilities/fetch-json.js'
import AboutContent from './AboutContent'

import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'

import Layout from 'antd/lib/layout'
import 'antd/lib/layout/style/css'

import Menu from 'antd/lib/menu'
import 'antd/lib/menu/style/css'

import Icon from 'antd/lib/icon'
import 'antd/lib/icon/style/css'

const { Content, Sider } = Layout

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      currentUser: {},
      version: {},
      passport: {},
      config: {},
      redirect: false
    }
  }

  onCollapse = collapsed => {
    this.setState({ collapsed })
  }

  componentDidMount() {
    fetchJson('GET', '/api/app').then(json => {
      this.setState({
        currentUser: json.currentUser,
        version: json.version,
        passport: json.passport,
        config: json.config
      })
    })
  }

  signout = () => {
    fetchJson('GET', '/api/signout').then(json => {
      this.setState({ redirect: true })
    })
  }

  renderUpdateNotification() {
    const { version = {} } = this.state

    if (version.updateAvailable) {
      return (
        <Menu.Item
          key="update"
          onClick={() => {
            Modal.info({
              title: 'Update Available (' + version.updateType + ')',
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
      )
    }
  }

  render() {
    const { redirect, version = {} } = this.state
    if (redirect) {
      return <Redirect push to="/signin" />
    }

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
                  <Menu.Item
                    key="connections"
                    onClick={() => {
                      history.push('/connections')
                    }}
                  >
                    <Icon type="database" />
                    <span>DB connections</span>
                  </Menu.Item>
                  <Menu.Item
                    key="users"
                    onClick={() => {
                      history.push('/users')
                    }}
                  >
                    <Icon type="team" />
                    <span>Users</span>
                  </Menu.Item>
                  <Menu.Item
                    key="configuration"
                    onClick={() => {
                      history.push('/config-values')
                    }}
                  >
                    <Icon type="setting" />
                    <span>Configuration</span>
                  </Menu.Item>
                </Menu>
              )}
            />

            <Menu theme="dark" selectable={false} mode="inline">
              {this.renderUpdateNotification()}
              <Menu.Item
                key="about"
                onClick={() => {
                  Modal.info({
                    width: 650,
                    title: 'About SQLPad',
                    maskClosable: true,
                    content: <AboutContent version={version.current} />,
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
          </div>
        </Sider>
        <Layout className="flex w-100 bg-white">
          <Content className="flex w-100">{this.props.children}</Content>
        </Layout>
      </Layout>
    )
  }
}

export default App
