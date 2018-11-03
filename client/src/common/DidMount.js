import React from 'react'
import PropTypes from 'prop-types'

class DidMount extends React.Component {
  componentDidMount() {
    const noop = () => {}
    typeof this.props.children === 'function' ? this.props.children() : noop()
  }

  render() {
    return null
  }
}

DidMount.propTypes = {
  children: PropTypes.func.isRequired
}

export default DidMount
