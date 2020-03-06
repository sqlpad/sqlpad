import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import Button from './common/Button';
import Input from './common/Input';
import message from './common/message';
import Spacer from './common/Spacer';
import fetchJson from './utilities/fetch-json.js';

function PasswordReset({ passwordResetId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [redirect, setRedirect] = useState(false);

  const resetPassword = async e => {
    e.preventDefault();
    const json = await fetchJson(
      'POST',
      '/api/password-reset/' + passwordResetId,
      {
        email,
        password,
        passwordConfirmation
      }
    );

    if (json.error) {
      return message.error(json.error);
    }
    setRedirect(true);
  };

  useEffect(() => {
    document.title = 'SQLPad - Password Reset';
  }, []);

  if (redirect) {
    return <Redirect to="/" />;
  }
  return (
    <div style={{ width: '300px', textAlign: 'center', margin: '100px auto' }}>
      <form onSubmit={resetPassword}>
        <h1>SQLPad</h1>
        <Input
          name="email"
          type="email"
          placeholder="Email address"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Spacer />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Spacer />
        <Input
          name="passwordConfirmation"
          type="password"
          placeholder="Confirm Password"
          onChange={e => setPasswordConfirmation(e.target.value)}
          required
        />
        <Spacer size={2} />
        <Button style={{ width: '100%' }} htmlType="submit" variant="primary">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default PasswordReset;
