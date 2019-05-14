import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import HorizontalFormItem from '../common/HorizontalFormItem';
import message from '../common/message';
import { actions } from '../stores/unistoreStore';
import fetchJson from '../utilities/fetch-json.js';
import ConfigItemInput from './ConfigItemInput';

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

  // This used to set disabled, but that was weird with the modal
  // reach modal sets focus on the first focusable element it would seem, which is a disabled button
  // Not only does that prevent `esc` key from closing modal, it doesn't show what is focused either
  const type = hasChanges.length > 0 ? 'primary' : null;

  return (
    <div>
      <HorizontalFormItem>
        <Button className="w-100" type={type} onClick={saveConfigValues}>
          Save
        </Button>
      </HorizontalFormItem>
      {configItems.map(config => (
        <ConfigItemInput
          key={config.key}
          config={config}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}

export default connect(
  [],
  actions
)(React.memo(ConfigurationForm));
