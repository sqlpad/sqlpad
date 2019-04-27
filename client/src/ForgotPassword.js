import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import fetchJson from './utilities/fetch-json.js';
import message from 'antd/lib/message';
import Input from 'antd/lib/input';
import Spacer from './common/Spacer';
import Button from 'antd/lib/button';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    document.title = 'SQLPad - Forgot Password';
  }, []);

  const resetPassword = async e => {
    e.preventDefault();
    const json = await fetchJson('POST', '/api/forgot-password', { email });
    if (json.error) {
      return message.error(json.error);
    }
    setRedirect(true);
  };

  if (redirect) {
    return <Redirect to="/password-reset" />;
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
        <Spacer size={2} />
        <Button style={{ width: '100%' }} htmlType="submit" type="primary">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default ForgotPassword;
