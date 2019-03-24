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
    <div className="pt5 measure center" style={{ width: '300px' }}>
      <form onSubmit={resetPassword}>
        <h1 className="f2 tc">SQLPad</h1>
        <input
          name="email"
          type="email"
          className="form-control mt3"
          placeholder="Email address"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="btn btn-primary btn-block mt3" type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
