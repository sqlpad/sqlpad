import message from 'antd/lib/message';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import fetchJson from '../utilities/fetch-json.js';
import ConfigItemInput from './ConfigItemInput';

const formItemLayout = {
  labelCol: {
    sm: { span: 12 }
  },
  wrapperCol: {
    sm: { span: 10 }
  }
};

const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 10,
      offset: 12
    }
  }
};

function ConfigurationForm({ refreshAppContext, onClose }) {
  const [configItems, setConfigItems] = useState([]);

  const loadConfigValuesFromServer = async () => {
    const json = await fetchJson('GET', '/api/config-items');
    if (json.error) {
      message.error(json.error);
    }
    setConfigItems(json.configItems);
  };

  useEffect(() => {
    loadConfigValuesFromServer();
  }, []);

  async function saveConfigValues() {
    const changedSaves = configItems
      .filter(item => item.changed)
      .map(item => {
        return fetchJson('POST', `/api/config-values/${item.key}`, {
          value: item.effectiveValue
        });
      });

    const responses = await Promise.all(changedSaves);
    const errorResponse = responses.find(r => r.error);
    if (errorResponse) {
      message.error('Save failed');
    } else {
      await refreshAppContext();
      onClose();
    }
  }

  const handleChange = (key, value) => {
    const items = configItems.map(item => {
      if (item.key === key) {
        return { ...item, effectiveValue: value, changed: true };
      }
      return item;
    });
    setConfigItems(items);
  };

  const hasChanges = configItems.filter(config => config.changed);
  const saveDisabled = hasChanges.length === 0;

  return (
    <Form {...formItemLayout}>
      <Form.Item {...tailFormItemLayout}>
        <Button
          disabled={saveDisabled}
          className="w-100"
          type="primary"
          onClick={saveConfigValues}
        >
          Save
        </Button>
      </Form.Item>
      {configItems.map(config => (
        <ConfigItemInput
          key={config.key}
          config={config}
          onChange={handleChange}
        />
      ))}
    </Form>
  );
}

export default connect(
  [],
  actions
)(React.memo(ConfigurationForm));
