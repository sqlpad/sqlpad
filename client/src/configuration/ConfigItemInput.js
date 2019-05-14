import React from 'react';
import Switch from 'react-switch';
import FormExplain from '../common/FormExplain';
import HorizontalFormItem from '../common/HorizontalFormItem';
import Input from '../common/Input';
import Select from '../common/Select';

function configIsBoolean(config) {
  const { options } = config;
  return (
    typeof config.effectiveValue === 'boolean' &&
    options &&
    options.length === 2 &&
    options.includes(true) &&
    options.includes(false)
  );
}

function ConfigItemInput({ config, onChange }) {
  const handleChange = e => {
    onChange(config.key, e.target.value);
  };

  const handleSelectChange = value => {
    onChange(config.key, value);
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
        <>
          <p>
            <span>Set By:</span> {overriddenBy}
          </p>
          <p>
            When set by command line or environment, item is not configurable
            via UI.
          </p>
        </>
      )}
    </div>
  );

  let input;
  if (configIsBoolean(config)) {
    input = (
      <Switch
        id={config.key}
        height={24}
        width={48}
        onColor={'#1890ff'}
        checked={config.effectiveValue}
        onChange={value => onChange(config.key, value)}
      />
    );
  } else if (config.options) {
    const optionNodes = config.options.map(option => {
      return (
        <option key={option} value={option}>
          {option.toString()}
        </option>
      );
    });
    input = (
      <Select
        id={config.key}
        className="w-100"
        disabled={disabled}
        onChange={handleSelectChange}
        value={config.effectiveValue}
      >
        {optionNodes}
      </Select>
    );
  } else {
    input = (
      <Input
        id={config.key}
        className="w-100"
        disabled={disabled}
        onChange={handleChange}
        placeholder={config.label}
        value={config.effectiveValue}
      />
    );
  }

  return (
    <HorizontalFormItem label={config.label}>
      <div>{input}</div>
      <FormExplain>{popoverContent}</FormExplain>
    </HorizontalFormItem>
  );
}

export default ConfigItemInput;
