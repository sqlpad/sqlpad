import React from 'react'
import Button from '../common/Button'
import { Link } from 'react-router-dom'

const PasswordResetButtonLink = props => {
  if (props.passwordResetId) {
    return (
      <span>
        <Button className="mr4" onClick={props.removePasswordResetLink}>
          remove
        </Button>{' '}
        <Link to={'/password-reset/' + props.passwordResetId}>
          Password Reset Link
        </Link>
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
