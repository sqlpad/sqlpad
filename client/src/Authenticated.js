import Component from '@reactions/component'
import PropTypes from 'prop-types'
import React from 'react'
import { Redirect } from 'react-router-dom'
import { Subscribe } from 'unstated'
import AppContainer from './containers/AppContainer'

class Authenticated extends React.Component {
  state = {
    refreshedAppContext: false
  }

  render() {
    const { refreshedAppContext } = this.state
    const { admin, children } = this.props

    return (
      <Subscribe to={[AppContainer]}>
        {appContainer => {
          const { currentUser } = appContainer.state

          if (!refreshedAppContext) {
            return (
              <Component
                didMount={async () => {
                  await appContainer.refreshAppContext()
                  this.setState({ refreshedAppContext: true })
                }}
              />
            )
          }

          if (!currentUser) {
            return <Redirect to={{ pathname: '/signin' }} />
          }

          if (admin && currentUser.role !== 'admin') {
            return <Redirect to={{ pathname: '/queries' }} />
          }

          return children
        }}
      </Subscribe>
    )
  }
}

Authenticated.propTypes = {
  admin: PropTypes.bool
}

export default Authenticated
