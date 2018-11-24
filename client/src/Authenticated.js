import PropTypes from 'prop-types'
import React from 'react'
import { Redirect } from 'react-router-dom'
import { Subscribe } from 'unstated'
import AppNav from './AppNav.js'
import AppContainer from './containers/AppContainer'

class Authenticated extends React.Component {
  state = {
    loading: true
  }

  render() {
    const { admin, component, ...rest } = this.props

    return (
      <Subscribe to={[AppContainer]}>
        {appContainer => {
          const { config, currentUser } = appContainer.state

          // TODO is this necessary?
          if (!config) {
            return <Component didMount={appContainer.refreshAppContext} />
          }

          if (!currentUser) {
            return <Redirect to={{ pathname: '/signin' }} />
          }

          if (admin && currentUser.role !== 'admin') {
            return <Redirect to={{ pathname: '/queries' }} />
          }

          const Component = component

          return (
            <AppNav>
              <Component config={config} currentUser={currentUser} {...rest} />
            </AppNav>
          )
        }}
      </Subscribe>
    )
  }
}

Authenticated.propTypes = {
  admin: PropTypes.bool,
  component: PropTypes.func.isRequired
}

export default Authenticated
