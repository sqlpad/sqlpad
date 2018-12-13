import PropTypes from 'prop-types'
import React from 'react'
import { Redirect } from 'react-router-dom'
import AppContext from './containers/AppContext'

class Authenticated extends React.Component {
  static contextType = AppContext

  componentDidMount() {
    const appContext = this.context
    appContext.refreshAppContext()
  }

  render() {
    const appContext = this.context
    const { admin, children } = this.props
    const { currentUser } = appContext

    if (!currentUser) {
      return <Redirect to={{ pathname: '/signin' }} />
    }

    if (admin && currentUser.role !== 'admin') {
      return <Redirect to={{ pathname: '/queries' }} />
    }

    return children
  }
}

Authenticated.propTypes = {
  admin: PropTypes.bool
}

export default Authenticated
