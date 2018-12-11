import Component from '@reactions/component'
import PropTypes from 'prop-types'
import React from 'react'
import { Redirect } from 'react-router-dom'
import AppContext from './containers/AppContext'

class Authenticated extends React.Component {
  state = {
    refreshedAppContext: false
  }

  render() {
    const { refreshedAppContext } = this.state
    const { admin, children } = this.props

    return (
      <AppContext.Consumer>
        {appContext => {
          const { currentUser } = appContext

          if (!refreshedAppContext) {
            return (
              <Component
                didMount={async () => {
                  await appContext.refreshAppContext()
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
      </AppContext.Consumer>
    )
  }
}

Authenticated.propTypes = {
  admin: PropTypes.bool
}

export default Authenticated
