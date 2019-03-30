import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
import Form from 'antd/lib/form';
import Popover from 'antd/lib/popover';
import React, { useState } from 'react';

const { Option } = Select;

function ConfigItemInput({ config, saveConfigValue }) {
  const [value, setValue] = useState(config.effectiveValue);

  const handleChange = e => {
    setValue(e.target.value);
    saveConfigValue(config.key, e.target.value);
  };

  const handleSelectChange = value => {
    setValue(value);
    saveConfigValue(config.key, value);
  };

  const disabled =
    config.effectiveValueSource === 'cli' ||
    config.effectiveValueSource === 'saved cli' ||
    config.effectiveValueSource === 'env';

  const effectiveValueSourceLabels = {
    cli: 'Command Line',
    'saved cli': 'Saved Command Line',
    env: 'Environment Varialbe'
  };
  const overriddenBy = effectiveValueSourceLabels[config.effectiveValueSource];

  const defaultValue =
    config.default === '' ? (
      <em>empty</em>
    ) : (
      <span>{config.default.toString()}</span>
    );

  const popoverContent = (
    <div style={{ maxWidth: 300 }}>
      <p>{config.description}</p>
      <p>
        <span>Default:</span> {defaultValue}
      </p>
      {disabled && (
        <div>
          <p>
            <span>Set By:</span> {overriddenBy}
          </p>
          <p>
            When set by command line or environment, item is not configurable
            via UI.
          </p>
        </div>
      )}
    </div>
  );

  let input;

  if (config.options) {
    const optionNodes = config.options.map(option => {
      return (
        <Option key={option} value={option}>
          {option.toString()}
        </Option>
      );
    });
    input = (
      <Select
        className="w-100"
        disabled={disabled}
        onChange={handleSelectChange}
        value={value}
      >
        {optionNodes}
      </Select>
    );
  } else {
    input = (
      <Input
        className="w-100"
        disabled={disabled}
        onChange={handleChange}
        placeholder={config.label}
        value={value}
      />
    );
  }

  return (
    <Form.Item label={config.label}>
      <Popover placement="right" content={popoverContent} trigger="hover">
        {input}
      </Popover>
    </Form.Item>
  );
}

export default ConfigItemInput;
