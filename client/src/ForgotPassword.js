import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import fetchJson from './utilities/fetch-json.js';
import message from 'antd/lib/message';

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
    <div style={{ width: '300px' }}>
      <form onSubmit={resetPassword}>
        <h1>SQLPad</h1>
        <input
          name="email"
          type="email"
          placeholder="Email address"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
