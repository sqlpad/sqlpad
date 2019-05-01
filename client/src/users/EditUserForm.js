import Form from 'antd/lib/form';
import message from 'antd/lib/message';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import React, { useState } from 'react';
import Button from '../common/Button';
import Select from '../common/Select';
import fetchJson from '../utilities/fetch-json.js';
import { Link } from 'react-router-dom';
import uuid from 'uuid';

const FormItem = Form.Item;

function EditUserForm({ user }) {
  const [role, setRole] = useState(user.role);
  const [passwordResetId, setPasswordResetId] = useState(user.passwordResetId);

  const handleRoleChange = async event => {
    setRole(event.target.value);
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      role: event.target.value
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
  };

  const generatePasswordResetLink = async () => {
    const passwordResetId = uuid.v4();
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId
    });
    if (json.error) {
      return message.error('Update failed: ' + json.error.toString());
    }
    setPasswordResetId(passwordResetId);
  };

  const removePasswordResetLink = async () => {
    const json = await fetchJson('PUT', '/api/users/' + user._id, {
      passwordResetId: ''
    });
    if (json.error) {
      return message.error('Remove reset failed: ' + json.error.toString());
    }
    setPasswordResetId(null);
  };

  const renderReset = () => {
    if (passwordResetId) {
      return (
        <Row type="flex" gutter={24} align="middle">
          <Col span={12}>
            <Button className="w-100" onClick={removePasswordResetLink}>
              Remove reset link
            </Button>
          </Col>
          <Col style={{ textAlign: 'center' }} span={12}>
            <Link to={`/password-reset/${passwordResetId}`}>
              Password reset link
            </Link>
          </Col>
        </Row>
      );
    }
    return (
      <Row gutter={24}>
        <Col span={12}>
          <Button className="w-100" onClick={generatePasswordResetLink}>
            Generate password reset link
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <Form layout="vertical">
      <FormItem
        label="Role"
        extra="Admins can manage database connections and users"
      >
        <Select name="role" value={role} onChange={handleRoleChange}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </Select>
      </FormItem>
      {renderReset()}
    </Form>
  );
}

export default EditUserForm;
