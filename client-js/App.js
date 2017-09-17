import React from 'react'
import Alert from 'react-s-alert'
import Navbar from 'react-bootstrap/lib/Navbar'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import NavDropdown from 'react-bootstrap/lib/NavDropdown'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import navigateToClickHandler from './utilities/navigateToClickHandler'
import fetchJson from './utilities/fetch-json.js'
import page from 'page'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showAboutModal: false,
      currentUser: {},
      version: {},
      passport: {},
      config: {}
    }
    this.openAboutModal = this.openAboutModal.bind(this)
    this.closeAboutModal = this.closeAboutModal.bind(this)
    this.signout = this.signout.bind(this)
  }

  openAboutModal () {
    this.setState({ showAboutModal: true })
  }

  closeAboutModal () {
    this.setState({ showAboutModal: false })
  }

  componentDidMount () {
    fetchJson('GET', this.props.config.baseUrl + '/api/app')
      .then(json => {
        // TODO - would it be good to adopt this all-in-one app route or is this bad?
        this.setState({
          currentUser: json.currentUser,
          version: json.version,
          passport: json.passport,
          config: json.config
        })
      })
      .catch(ex => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  }

  signout () {
    fetchJson('GET', this.props.config.baseUrl + '/api/signout')
      .then(json => {
        page('/')
      })
      .catch(ex => {
        console.error(ex.toString())
        Alert.error('Problem signing out')
      })
  }

  render () {
    const popover = (
      <Popover
        id='modal-popover'
        title={'Update Available (' + this.state.version.updateType + ')'}
      >
        Installed Version: {this.state.version.current}
        <br />
        Latest: {this.state.version.latest}
      </Popover>
    )
    const updateNotification = () => {
      if (this.state.version.updateAvailable) {
        return (
          <OverlayTrigger overlay={popover} placement='bottom'>
            <NavItem eventKey={9}>
              <span className='glyphicon glyphicon-upload' aria-hidden='true' />
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
            id='user-nav-dropdown'
          >
            <MenuItem
              eventKey={3.1}
              onClick={navigateToClickHandler('/connections')}
            >
              Connections
            </MenuItem>
            <MenuItem eventKey={3.2} onClick={navigateToClickHandler('/users')}>
              Users
            </MenuItem>
            <MenuItem
              eventKey={3.3}
              onClick={navigateToClickHandler('/config-values')}
            >
              Configuration
            </MenuItem>
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
            id='user-nav-dropdown'
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
      <div style={{ display: 'flex', width: '100%' }}>
        <Navbar inverse fluid fixedTop>
          <Nav>
            <NavItem eventKey={1} onClick={navigateToClickHandler('/queries')}>
              Queries
            </NavItem>
            {/*
              NOTE: /queries/new is *NOT* handled by page.js.
              clicking new while on new creates weirdness that needs to be worked out.
            */}
            <NavItem
              eventKey={2}
              href={this.props.config.baseUrl + '/queries/new'}
            >
              New Query
            </NavItem>
          </Nav>
          <Nav pullRight>
            {updateNotification()}
            {userMenu()}
          </Nav>
        </Navbar>
        <div style={{ display: 'flex', width: '100%' }}>
          {this.props.children}
        </div>
        <Alert stack={{ limit: 3 }} position='bottom-right' />
        <Modal show={this.state.showAboutModal} onHide={this.closeAboutModal}>
          <Modal.Header closeButton>
            <Modal.Title>About SQLPad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Version</strong>: {this.state.version.current}
            </p>
            <p>
              <strong>Project Page</strong>:{' '}
              <a
                href='http://rickbergfalk.github.io/sqlpad/'
                target='_blank'
                rel='noopener noreferrer'
              >
                http://rickbergfalk.github.io/sqlpad{' '}
                <span
                  style={{ marginLeft: 4 }}
                  className='glyphicon glyphicon-new-window'
                  aria-hidden='true'
                />
              </a>
            </p>
            <hr />
            <ul className='nav nav-pills nav-justified'>
              <li role='presentation'>
                <a
                  href='https://github.com/rickbergfalk/sqlpad/issues'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Submit an Issue{' '}
                  <span
                    className='glyphicon glyphicon-new-window'
                    aria-hidden='true'
                  />
                </a>
              </li>
              <li role='presentation'>
                <a
                  href='https://github.com/rickbergfalk/sqlpad/blob/master/CHANGELOG.md'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Changelog{' '}
                  <span
                    className='glyphicon glyphicon-new-window'
                    aria-hidden='true'
                  />
                </a>
              </li>
              <li role='presentation'>
                <a
                  href='https://github.com/rickbergfalk/sqlpad'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  GitHub Repository{' '}
                  <span
                    className='glyphicon glyphicon-new-window'
                    aria-hidden='true'
                  />
                </a>
              </li>
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeAboutModal}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default App
