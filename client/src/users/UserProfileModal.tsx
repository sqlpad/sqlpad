import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import Button from '../common/Button';
import FormExplain from '../common/FormExplain';
import HSpacer from '../common/HSpacer';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Spacer from '../common/Spacer';
import Text from '../common/Text';
import { api } from '../utilities/api';
import useAppContext from '../utilities/use-app-context';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function ErrorText({ error }: { error: string }) {
  if (!error) {
    return null;
  }
  return (
    <FormExplain>
      <Text type="danger">{error}</Text>
    </FormExplain>
  );
}

function UserProfileModal({ visible, onClose }: Props) {
  const { config, currentUser } = useAppContext();
  const initialRef = useRef(null);

  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');

  if (!currentUser?.id) {
    return null;
  }

  function handleCancel() {
    onClose();
    setEmail(currentUser?.email || '');
    setName(currentUser?.name || '');
    setPassword('');
    setPasswordConfirmation('');
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const errs: Record<string, string> = {};

    if (
      (password || passwordConfirmation) &&
      password !== passwordConfirmation
    ) {
      errs.passwordConfirmation = 'Passwords do not match';
    }

    if (!email) {
      errs.email = 'Email is required';
    }

    setErrors(errs);

    if (Object.keys(errs).length) {
      return;
    }

    const updates = {
      email,
      name,
      password: password || undefined,
    };
    setSaving(true);
    const json = await api.updateUser(currentUser.id, updates);
    setSaving(false);
    if (json.error) {
      setSaveError(json.error);
      return;
    }
    onClose();
  };

  return (
    <Modal
      title="Profile"
      width={'500px'}
      visible={visible}
      onClose={handleCancel}
      initialFocusRef={initialRef}
    >
      <div>
        <form onSubmit={handleSave}>
          <label>
            Name
            <Input
              ref={initialRef}
              name="name"
              type="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />
          </label>
          <Spacer size={2} />
          <label>
            Email
            <Input
              name="email"
              type="email"
              value={email}
              error={Boolean(errors.email)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <ErrorText error={errors.email} />
          </label>
          <Spacer size={2} />
          {config?.localAuthConfigured && (
            <>
              <label>
                Password
                <Input
                  autoComplete="new-password"
                  name="password"
                  type="password"
                  value={password}
                  error={Boolean(errors.passwordConfirmation)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
              </label>
              <Spacer size={2} />
              <label>
                Confirm password
                <Input
                  autoComplete="new-password"
                  name="passwordConfirmation"
                  type="password"
                  value={passwordConfirmation}
                  error={Boolean(errors.passwordConfirmation)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPasswordConfirmation(e.target.value)
                  }
                />
                <ErrorText error={errors.passwordConfirmation} />
              </label>
              <Spacer size={2} />
            </>
          )}

          {saveError && (
            <>
              <Text type="danger">{saveError}</Text>
              <Spacer size={2} />
            </>
          )}

          <div
            style={{
              display: 'flex',
              marginTop: 16,
            }}
          >
            <Button
              htmlType="submit"
              style={{ width: '50%' }}
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              Save
            </Button>
            <HSpacer />
            <Button style={{ width: '50%' }} onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default UserProfileModal;
