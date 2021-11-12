import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import message from '../common/message';
import Spacer from '../common/Spacer';
import { api } from '../utilities/api';

interface Params {
  passwordResetId: string;
}

function PasswordReset() {
  const { passwordResetId } = useParams<Params>();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const resetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = { email, password, passwordConfirmation };
    const json = await api.post(`/api/password-reset/${passwordResetId}`, body);

    if (json.error) {
      return message.error(json.error);
    }
    history.push('/');
  };

  useEffect(() => {
    document.title = 'SQLPad - Password Reset';
  }, []);

  return (
    <div style={{ width: '300px', textAlign: 'center', margin: '100px auto' }}>
      <form onSubmit={resetPassword}>
        <h1>SQLPad</h1>
        <Input
          name="email"
          type="email"
          placeholder="Email address"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />
        <Spacer />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
        />
        <Spacer />
        <Input
          name="passwordConfirmation"
          type="password"
          placeholder="Confirm Password"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPasswordConfirmation(e.target.value)
          }
          required
        />
        <Spacer size={2} />
        <Button style={{ width: '100%' }} htmlType="submit" variant="primary">
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default PasswordReset;
