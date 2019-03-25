import AutoComplete from 'antd/lib/auto-complete';
import Icon from 'antd/lib/icon';
import Tag from 'antd/lib/tag';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';

function EditableTagGroup({ onChange, tags, tagOptions }) {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputEl = useRef(null);

  useEffect(() => {
    if (inputVisible && inputValue === '') {
      inputEl.current.focus();
    }
  }, [inputVisible, inputValue]);

  const handleClose = removedTag => {
    const { onChange, tags } = this.props;
    const newTags = tags.filter(tag => tag !== removedTag);
    onChange(newTags);
  };

  const showInput = () => {
    setInputValue('');
    setInputVisible(true);
  };

  const handleInputChange = value => setInputValue(value);

  const handleInputBlur = () => {
    setInputValue('');
    setInputVisible(false);
  };

  const handleInputSelect = value => {
    if (value && tags.indexOf(value) === -1) {
      tags = [...tags, value];
    }
    setInputValue('');
    setInputVisible(false);
    onChange(tags); // TODO this was done on callback?
  };

  const filterOption = (inputValue, option) =>
    option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !==
    -1;

  const dataSource = tagOptions.slice();
  if (inputValue && dataSource.indexOf(inputValue) === -1) {
    dataSource.unshift(inputValue);
  }

  return (
    <div>
      {tags.map((tag, index) => {
        return (
          <Tag key={tag} closable={true} afterClose={() => handleClose(tag)}>
            {tag}
          </Tag>
        );
      })}
      {inputVisible && (
        <AutoComplete
          style={{ width: 140 }}
          dataSource={dataSource}
          ref={inputEl}
          filterOption={filterOption}
          type="text"
          size="small"
          value={inputValue}
          onChange={handleInputChange}
          onSelect={handleInputSelect}
          onBlur={handleInputBlur}
        />
      )}
      {!inputVisible && (
        <Tag
          onClick={showInput}
          style={{ background: '#fff', borderStyle: 'dashed' }}
        >
          <Icon type="plus" /> New Tag
        </Tag>
      )}
    </div>
  );
}

EditableTagGroup.propTypes = {
  onChange: PropTypes.func,
  tagOptions: PropTypes.array,
  tags: PropTypes.array
};

EditableTagGroup.defaultProps = {
  onChange: () => {},
  tagOptions: [],
  tags: []
};

export default EditableTagGroup;
