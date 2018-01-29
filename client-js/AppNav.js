import React from 'react'
import { Redirect } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import Navbar from 'react-bootstrap/lib/Navbar'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import NavDropdown from 'react-bootstrap/lib/NavDropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'

import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import fetchJson from './utilities/fetch-json.js'
import Modal from './common/Modal'
import AboutContent from './AboutContent'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAboutModal: false,
      currentUser: {},
      version: {},
      passport: {},
      config: {},
      redirect: false
    }
    this.openAboutModal = this.openAboutModal.bind(this)
    this.closeAboutModal = this.closeAboutModal.bind(this)
    this.signout = this.signout.bind(this)
  }

  openAboutModal() {
    this.setState({ showAboutModal: true })
  }

  closeAboutModal() {
    this.setState({ showAboutModal: false })
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

  signout() {
    fetchJson('GET', '/api/signout').then(json => {
      this.setState({ redirect: true })
    })
  }

  render() {
    const { redirect, version = {} } = this.state
    if (redirect) {
      return <Redirect push to="/signin" />
    }
    const popover = (
      <Popover
        id="modal-popover"
        title={'Update Available (' + this.state.version.updateType + ')'}
      >
        Installed Version: {this.state.version.current}
        <br />
        Latest: {this.state.version.latest}
      </Popover>
    )
    const updateNotification = () => {
      if (version.updateAvailable) {
        return (
          <OverlayTrigger overlay={popover} placement="bottom">
            <NavItem eventKey={9}>
              <span className="glyphicon glyphicon-upload" aria-hidden="true" />
            </NavItem>
          </OverlayTrigger>
        )
      }
    }
    const userMenu = () => {
      if (this.props.currentUser.role === 'admin') {
        return (
          <NavDropdown
            eventKey={3}
            title={this.props.currentUser.email.split('@')[0]}
            id="user-nav-dropdown"
          >
            <LinkContainer to="/connections">
              <MenuItem eventKey={3.1}>Connections</MenuItem>
            </LinkContainer>
            <LinkContainer to="/users">
              <MenuItem eventKey={3.2}>Users</MenuItem>
            </LinkContainer>
            <LinkContainer to="/config-values">
              <MenuItem eventKey={3.3}>Configuration</MenuItem>
            </LinkContainer>
            <MenuItem divider />
            <MenuItem eventKey={3.4} onClick={this.openAboutModal}>
              About SQLPad
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.5} onClick={this.signout}>
              Sign Out
            </MenuItem>
          </NavDropdown>
        )
      } else {
        return (
          <NavDropdown
            eventKey={3}
            title={this.props.currentUser.email.split('@')[0]}
            id="user-nav-dropdown"
          >
            <MenuItem eventKey={3.4} onClick={this.openAboutModal}>
              About SQLPad
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.5} onClick={this.signout}>
              Sign Out
            </MenuItem>
          </NavDropdown>
        )
      }
    }
    return (
      <div className="flex w-100">
        <Navbar inverse fluid fixedTop>
          <Nav>
            <LinkContainer exact to="/queries">
              <NavItem eventKey={1}>Queries</NavItem>
            </LinkContainer>
            <LinkContainer exact to="/queries/new">
              <NavItem eventKey={2}>New Query</NavItem>
            </LinkContainer>
          </Nav>
          <Nav pullRight>
            {updateNotification()}
            {userMenu()}
          </Nav>
        </Navbar>
        <div className="flex w-100" style={{ marginTop: '50px' }}>
          {this.props.children}
        </div>
        <Modal
          title="About SQLPad"
          show={this.state.showAboutModal}
          onHide={this.closeAboutModal}
          renderBody={() => <AboutContent version={version.current} />}
          renderFooter={() => (
            <Button onClick={this.closeAboutModal}>Close</Button>
          )}
        />
      </div>
    )
  }
}

export default App
