import GoogleIcon from 'mdi-react/GoogleIcon';
import React, { useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { mutate } from 'swr';
import Button from './common/Button';
import Input from './common/Input';
import message from './common/message';
import Spacer from './common/Spacer';
import { api } from './utilities/fetch-json.js';
import useAppContext from './utilities/use-app-context';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  const { config, currentUser } = useAppContext();

  useEffect(() => {
    document.title = 'SQLPad - Sign In';
  }, []);

  const signIn = async (e) => {
    e.preventDefault();

    const json = await api.post('/api/signin', { email, password });
    if (json.error) {
      return message.error('Username or password incorrect');
    }
    await mutate('api/app');
    setRedirect(true);
  };

  if (redirect && currentUser) {
    return <Redirect push to="/" />;
  }

  if (!config) {
    return;
  }

  const localForm = (
    <form onSubmit={signIn}>
      <Input
        name="email"
        type="email"
        placeholder="LDAP User / Email"
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
      <Spacer size={2} />
      <Button
        style={{ width: '100%' }}
        onClick={signIn}
        htmlType="submit"
        variant="primary"
      >
        Sign in
      </Button>
      <Spacer />
      <Link
        style={{
          display: 'inline-block',
          width: '100%',
          textAlign: 'center',
        }}
        to="/signup"
      >
        Sign Up
      </Link>

      {config.smtpConfigured ? (
        <Link to="/forgot-password">Forgot Password</Link>
      ) : null}
    </form>
  );

  // TODO FIXME XXX Button inside anchor is bad
  const googleForm = (
    <div>
      <a href={config.baseUrl + '/auth/google'}>
        <Button variant="primary">
          <GoogleIcon />
          Sign in with Google
        </Button>
      </a>
    </div>
  );

  function createMarkupForSamlLink() {
    return { __html: config.samlLinkHtml };
  }

  const samlForm = (
    <div>
      <a href={config.baseUrl + '/auth/saml'}>
        <span dangerouslySetInnerHTML={createMarkupForSamlLink()} />
      </a>
    </div>
  );

  return (
    <div style={{ width: '300px', textAlign: 'center', margin: '100px auto' }}>
      <h1>SQLPad</h1>
      {config.localAuthConfigured && localForm}
      {config.googleAuthConfigured && googleForm}
      {config.samlConfigured && samlForm}
    </div>
  );
}

export default SignIn;
