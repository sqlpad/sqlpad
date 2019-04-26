import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from './stores/unistoreStore';
import { Link, Redirect } from 'react-router-dom';
import fetchJson from './utilities/fetch-json.js';

function SignIn({ config, smtpConfigured, passport, refreshAppContext }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    document.title = 'SQLPad - Sign In';
  }, []);

  const signIn = async e => {
    e.preventDefault();

    const json = await fetchJson('POST', '/api/signin', { email, password });
    if (json.error) {
      return message.error('Username or password incorrect');
    }
    await refreshAppContext();
    setRedirect(true);
  };

  if (redirect) {
    return <Redirect push to="/" />;
  }

  if (!config) {
    return;
  }

  const localForm = (
    <div>
      <form onSubmit={signIn}>
        <Input
          name="email"
          type="email"
          placeholder="Email address"
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button onClick={signIn} htmlType="submit" type="primary">
          Sign in
        </Button>
      </form>
      <div>
        <Link to="/signup">Sign Up</Link>
        {smtpConfigured ? (
          <Link to="/forgot-password">Forgot Password</Link>
        ) : null}
      </div>
    </div>
  );

  const googleForm = (
    <div>
      <a href={config.baseUrl + '/auth/google'}>
        <Button type="primary">
          <Icon type="google" />
          Sign in with Google
        </Button>
      </a>
    </div>
  );

  return (
    <div style={{ width: '300px' }}>
      <h1>SQLPad</h1>
      {'local' in passport.strategies && localForm}
      {'google' in passport.strategies && googleForm}
    </div>
  );
}

export default connect(
  ['config', 'smtpConfigured', 'passport'],
  actions
)(SignIn);
