import GoogleIcon from 'mdi-react/GoogleIcon';
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Button from '../common/Button';
import ButtonLink from '../common/ButtonLink';
import HSpacer from '../common/HSpacer';
import Input from '../common/Input';
import message from '../common/message';
import Spacer from '../common/Spacer';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const { config } = useAppContext();

  useEffect(() => {
    document.title = 'SQLPad - Sign In';
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const json = await api.post('/api/signin', { email, password });
    if (json.error) {
      return message.error('Username or password incorrect');
    }
    await api.reloadAppInfo();
    history.push('/');
  };

  if (!config) {
    return null;
  }

  let placeholderText = '';
  if (config.ldapConfigured && config.localAuthConfigured) {
    placeholderText = 'username or email address';
  } else if (config.ldapConfigured) {
    placeholderText = 'username';
  } else if (config.localAuthConfigured) {
    placeholderText = 'email address';
  }

  const localLdapForm = (
    <form onSubmit={signIn}>
      <Input
        name="email"
        type="email"
        placeholder={placeholderText}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
        required
      />
      <Spacer />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
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

      {config.localAuthConfigured && (
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
      )}
    </form>
  );

  const googleForm = (
    <div>
      <Spacer />
      <ButtonLink
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        href={config.baseUrl + '/auth/google'}
        variant="primary"
      >
        <GoogleIcon />
        <HSpacer />
        Sign in with Google
      </ButtonLink>
    </div>
  );

  function createMarkupForSamlLink() {
    return { __html: config?.samlLinkHtml || '' };
  }

  const samlForm = (
    <div>
      <Spacer />
      <a href={config.baseUrl + '/auth/saml'}>
        <span dangerouslySetInnerHTML={createMarkupForSamlLink()} />
      </a>
    </div>
  );

  const oidcForm = (
    <div>
      <Spacer />
      <ButtonLink
        variant="primary"
        style={{
          width: '100%',
          textAlign: 'center',
        }}
        href={config.baseUrl + '/auth/oidc'}
      >
        <div
          className="w-100"
          dangerouslySetInnerHTML={{ __html: config.oidcLinkHtml }}
        />
      </ButtonLink>
    </div>
  );

  return (
    <div style={{ width: '300px', textAlign: 'center', margin: '100px auto' }}>
      <h1>SQLPad</h1>
      {(config.localAuthConfigured || config.ldapConfigured) && localLdapForm}
      {config.googleAuthConfigured && googleForm}
      {config.samlConfigured && samlForm}
      {config.oidcConfigured && oidcForm}
    </div>
  );
}

export default SignIn;
