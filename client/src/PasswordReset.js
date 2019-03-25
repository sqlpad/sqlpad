import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
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
    <div className="pt5 measure center" style={{ width: '300px' }}>
      <form onSubmit={resetPassword}>
        <h1 className="f2 tc">SQLPad</h1>
        <Input
          name="email"
          type="email"
          className="mt3"
          placeholder="Email address"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          name="password"
          type="password"
          className="mt3"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Input
          name="passwordConfirmation"
          type="password"
          className="mt3"
          placeholder="Confirm Password"
          onChange={e => setPasswordConfirmation(e.target.value)}
          required
        />
        <Button className="w-100 mt3" htmlType="submit" type="primary">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default PasswordReset;
