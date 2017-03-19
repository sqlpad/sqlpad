var React = require('react')
var Alert = require('react-s-alert').default
var fetchJson = require('./utilities/fetch-json.js')
var Navbar = require('react-bootstrap/lib/Navbar')
var Nav = require('react-bootstrap/lib/Nav')
var NavItem = require('react-bootstrap/lib/NavItem')
var NavDropdown = require('react-bootstrap/lib/NavDropdown')
var MenuItem = require('react-bootstrap/lib/MenuItem')
var Modal = require('react-bootstrap/lib/Modal')
var Button = require('react-bootstrap/lib/Button')
var Popover = require('react-bootstrap/lib/Popover')
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger')
import navigateToClickHandler from './utilities/navigateToClickHandler'
var page = require('page')

var App = React.createClass({
  getInitialState: function () {
    return {
      showAboutModal: false,
      currentUser: {},
      version: {},
      passport: {},
      config: {}
    }
  },
  openAboutModal: function () {
    this.setState({showAboutModal: true})
  },
  closeAboutModal: function () {
    this.setState({showAboutModal: false})
  },
  componentDidMount: function () {
    fetchJson('GET', this.props.config.baseUrl + '/api/app')
      .then((json) => {
        // TODO - would it be good to adopt this all-in-one app route or is this bad?
        this.setState({
          currentUser: json.currentUser,
          version: json.version,
          passport: json.passport,
          config: json.config
        })
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Something is broken')
      })
  },
  signout: function () {
    fetchJson('GET', this.props.config.baseUrl + '/api/signout')
      .then((json) => {
        page('/')
      })
      .catch((ex) => {
        console.error(ex.toString())
        Alert.error('Problem signing out')
      })
  },
  render: function () {
    // do stuff
    const popover = (
      <Popover id='modal-popover' title={'Update Available (' + this.state.version.updateType + ')'} >
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
          <NavDropdown eventKey={3} title={this.props.currentUser.email.split('@')[0]} id='user-nav-dropdown'>
            <MenuItem eventKey={3.1} onClick={navigateToClickHandler('/connections')} >Connections</MenuItem>
            <MenuItem eventKey={3.2} onClick={navigateToClickHandler('/users')} >Users</MenuItem>
            <MenuItem eventKey={3.3} onClick={navigateToClickHandler('/config-values')} >Configuration</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.4} onClick={this.openAboutModal} >About SqlPad</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.5} onClick={this.signout}>Sign Out</MenuItem>
          </NavDropdown>
        )
      } else {
        return (
          <NavDropdown eventKey={3} title={this.props.currentUser.email.split('@')[0]} id='user-nav-dropdown'>
            <MenuItem eventKey={3.4} onClick={this.openAboutModal} >About SqlPad</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.5} onClick={this.signout}>Sign Out</MenuItem>
          </NavDropdown>
        )
      }
    }
    return (
      <div>
        <Navbar inverse fluid fixedTop>
          <Nav>
            <NavItem eventKey={1} onClick={navigateToClickHandler('/queries')} >Queries</NavItem>
            {/*
              NOTE: /queries/new is *NOT* handled by page.js.
              clicking new while on new creates weirdness that needs to be worked out.
            */}
            <NavItem eventKey={2} href={this.props.config.baseUrl + '/queries/new'}>New Query</NavItem>
          </Nav>
          <Nav pullRight>
            {updateNotification()}
            {userMenu()}
          </Nav>
        </Navbar>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 50}}>
          {this.props.children}
        </div>
        <Alert stack={{limit: 3}} position='bottom-right' />
        <Modal show={this.state.showAboutModal} onHide={this.closeAboutModal}>
          <Modal.Header closeButton>
            <Modal.Title>About SqlPad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Version</strong>: {this.state.version.current}
            </p>
            <p>
              <strong>Project Page</strong>: <a href='http://rickbergfalk.github.io/sqlpad/' target='_blank'>http://rickbergfalk.github.io/sqlpad <span style={{marginLeft: 4}} className='glyphicon glyphicon-new-window' aria-hidden='true' /></a>
            </p>
            <hr />
            <ul className='nav nav-pills nav-justified'>
              <li role='presentation'>
                <a href='https://github.com/rickbergfalk/sqlpad/issues' target='_blank'>
                  Submit an Issue <span className='glyphicon glyphicon-new-window' aria-hidden='true' />
                </a>
              </li>
              <li role='presentation'>
                <a href='https://github.com/rickbergfalk/sqlpad/blob/master/CHANGELOG.md' target='_blank'>
                  Changelog <span className='glyphicon glyphicon-new-window' aria-hidden='true' />
                </a>
              </li>
              <li role='presentation'>
                <a href='https://github.com/rickbergfalk/sqlpad' target='_blank'>
                  GitHub Repository <span className='glyphicon glyphicon-new-window' aria-hidden='true' />
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
})

module.exports = App
