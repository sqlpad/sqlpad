import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import Button from './common/Button';
import Input from './common/Input';
import message from './common/message';
import Spacer from './common/Spacer';
import fetchJson from './utilities/fetch-json.js';
import useAppContext from './utilities/use-app-context';

function SignUp() {
  const { adminRegistrationOpen } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    document.title = 'SQLPad - Sign Up';
  }, []);

  const signUp = async (e) => {
    e.preventDefault();
    const json = await fetchJson('POST', '/api/signup', {
      email,
      password,
      passwordConfirmation,
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
    <div style={{ width: '300px', textAlign: 'center', margin: '100px auto' }}>
      <form onSubmit={signUp}>
        <h1>SQLPad</h1>
        {adminRegistrationOpen && (
          <div>
            <h2>Admin registration open</h2>
            <p>
              Welcome to SQLPad! Since there are no admins currently registered,
              signup is open to anyone. By signing up, you will be granted admin
              rights, and signup will be restricted to added email addresses and
              allowed domains
            </p>
          </div>
        )}
        <Input
          name="email"
          type="email"
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Spacer />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Spacer />
        <Input
          name="passwordConfirmation"
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        <Spacer size={2} />
        <Button style={{ width: '100%' }} htmlType="submit" variant="primary">
          Sign up
        </Button>
      </form>
    </div>
  );
}

export default SignUp;
