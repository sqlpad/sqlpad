import React from 'react'
import Button from 'react-bootstrap/lib/Button'

const PasswordResetButtonLink = props => {
  const style = {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    display: 'block'
  }
  if (props.passwordResetId) {
    return (
      <span style={style}>
        <Button onClick={props.removePasswordResetLink}>remove</Button>{' '}
        <a href={'/password-reset/' + props.passwordResetId}>
          Password Reset Link
        </a>
      </span>
    )
  }
  return (
    <Button style={style} onClick={props.generatePasswordResetLink}>
      Generate Password Reset Link
    </Button>
  )
}

export default PasswordResetButtonLink
