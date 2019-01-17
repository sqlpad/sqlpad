import React from 'react'
import PropTypes from 'prop-types'

class Button extends React.Component {
  render() {
    const { children, className, onClick, primary } = this.props
    let classNames = ''
    if (primary) {
      classNames = `
        pa4 tc pv3
        bg-animate bg-blue hover-bg-dark-blue white
        ${className}
      `
    } else {
      classNames = `
        pa4 tc pv3
        dim ba b--dark-gray black
        ${className}
      `
    }

    return (
      <button className={classNames} onClick={onClick}>
        {children}
      </button>
    )
  }
}

Button.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  primary: PropTypes.bool
}

Button.defaultProps = {
  className: '',
  onClick: () => {}
}

export default Button
