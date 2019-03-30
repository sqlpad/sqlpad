import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import Select from 'antd/lib/select';
import React, { useState } from 'react';
import fetchJson from '../utilities/fetch-json.js';
import { Link } from 'react-router-dom';
import uuid from 'uuid';

const FormItem = Form.Item;
const { Option } = Select;

function EditUserForm({ user }) {
  const [role, setRole] = useState(user.role);
  const [passwordResetId, setPasswordResetId] = useState(user.passwordResetId);

  const handleRoleChange = async role => {
    setRole(role);
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      role
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    message.success('User Updated');
  };

  const generatePasswordResetLink = async () => {
    const passwordResetId = uuid.v4();
    setPasswordResetId(passwordResetId);
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    message.success('Password link generated');
  };

  const removePasswordResetLink = async () => {
    setPasswordResetId(null);
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId: ''
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    message.success('Password reset link removed');
  };

  const renderReset = () => {
    if (passwordResetId) {
      return (
        <span>
          <Button className="w4 mr3" onClick={removePasswordResetLink}>
            Remove
          </Button>
          <Link className="w4" to={`/password-reset/${passwordResetId}`}>
            Reset Link
          </Link>
        </span>
      );
    }
    return (
      <Button className="w4" onClick={generatePasswordResetLink}>
        Generate Link
      </Button>
    );
  };

  return (
    <Form layout="vertical">
      <FormItem>
        <label className="near-black">Email</label>
        <Input name="email" disabled value={user.email} />
      </FormItem>
      <FormItem>
        <label className="near-black">Role</label>
        <Select name="role" value={role} onChange={handleRoleChange}>
          <Option value="editor">Editor</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </FormItem>
      {renderReset()}
    </Form>
  );
}

export default EditUserForm;
