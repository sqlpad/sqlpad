import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from './stores/unistoreStore';
import { Redirect } from 'react-router-dom';
import fetchJson from './utilities/fetch-json.js';

function SignUp({ adminRegistrationOpen }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    document.title = 'SQLPad - Sign Up';
  }, []);

  const signUp = async e => {
    e.preventDefault();
    const json = await fetchJson('POST', '/api/signup', {
      email,
      password,
      passwordConfirmation
    });
    if (json.error) {
      return message.error(json.error);
    }
    setRedirect(true);
  };

  if (redirect) {
    return <Redirect to="/" />;
  }

  return (
    <div style={{ width: '300px' }}>
      <form onSubmit={signUp}>
        <h1>SQLPad</h1>
        {adminRegistrationOpen && (
          <div>
            <h2>Admin registration open</h2>
            <p>
              Welcome to SQLPad! Since there are no admins currently registered,
              signup is open to anyone. By signing up, you will be granted admin
              rights, and signup will be restricted to whitelisted email
              addresses/domains
            </p>
          </div>
        )}
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
        <Input
          name="passwordConfirmation"
          type="password"
          placeholder="Confirm Password"
          onChange={e => setPasswordConfirmation(e.target.value)}
          required
        />
        <Button htmlType="submit" type="primary">
          Sign up
        </Button>
      </form>
    </div>
  );
}

export default connect(
  ['adminRegistrationOpen'],
  actions
)(SignUp);
