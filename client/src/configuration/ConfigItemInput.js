import Input from 'antd/lib/input';
import Select from 'antd/lib/select';
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

  if (config.options) {
    const optionNodes = config.options.map(option => {
      return (
        <Option key={option} value={option}>
          {option.toString()}
        </Option>
      );
    });
    return (
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
    return (
      <Input
        className="w-100"
        disabled={disabled}
        onChange={handleChange}
        placeholder={config.label}
        value={value}
      />
    );
  }
}

export default ConfigItemInput;
