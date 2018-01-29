import React from 'react'
import Button from '../common/Button'

const PasswordResetButtonLink = props => {
  if (props.passwordResetId) {
    return (
      <span>
        <Button className="mr4" onClick={props.removePasswordResetLink}>
          remove
        </Button>{' '}
        <a href={'/password-reset/' + props.passwordResetId}>
          Password Reset Link
        </a>
      </span>
    )
  }
  return (
    <Button onClick={props.generatePasswordResetLink}>
      Generate Password Reset Link
    </Button>
  )
}

export default PasswordResetButtonLink
