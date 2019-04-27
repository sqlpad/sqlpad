import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import fetchJson from './utilities/fetch-json.js';
import Spacer from './common/Spacer';

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
        <Button style={{ width: '100%' }} htmlType="submit" type="primary">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default PasswordReset;
