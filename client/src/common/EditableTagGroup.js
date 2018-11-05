import AutoComplete from 'antd/lib/auto-complete'
import Icon from 'antd/lib/icon'
import Tag from 'antd/lib/tag'
import PropTypes from 'prop-types'
import React from 'react'

class EditableTagGroup extends React.Component {
  state = {
    inputVisible: false,
    inputValue: ''
  }

  handleClose = removedTag => {
    const { onChange, tags } = this.props
    const newTags = tags.filter(tag => tag !== removedTag)
    onChange(newTags)
  }

  showInput = () => {
    this.setState({ inputValue: '', inputVisible: true }, () =>
      this.input.focus()
    )
  }

  handleInputChange = value => {
    this.setState({ inputValue: value })
  }

  handleInputBlur = () => {
    this.setState({
      inputValue: '',
      inputVisible: false
    })
  }

  handleInputSelect = value => {
    let { tags, onChange } = this.props

    if (value && tags.indexOf(value) === -1) {
      tags = [...tags, value]
    }

    this.setState(
      {
        inputValue: '',
        inputVisible: false
      },
      () => {
        onChange(tags)
      }
    )
  }

  saveInputRef = input => (this.input = input)

  filterOption = (inputValue, option) =>
    option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1

  render() {
    const { tags, tagOptions } = this.props
    const { inputVisible, inputValue } = this.state

    const dataSource = tagOptions.slice()
    if (inputValue && dataSource.indexOf(inputValue) === -1) {
      dataSource.unshift(inputValue)
    }

    return (
      <div>
        {tags.map((tag, index) => {
          return (
            <Tag
              key={tag}
              closable={true}
              afterClose={() => this.handleClose(tag)}
            >
              {tag}
            </Tag>
          )
        })}
        {inputVisible && (
          <AutoComplete
            style={{ width: 140 }}
            dataSource={dataSource}
            ref={this.saveInputRef}
            filterOption={this.filterOption}
            type="text"
            size="small"
            value={inputValue}
            onChange={this.handleInputChange}
            onSelect={this.handleInputSelect}
            onBlur={this.handleInputBlur}
          />
        )}
        {!inputVisible && (
          <Tag
            onClick={this.showInput}
            style={{ background: '#fff', borderStyle: 'dashed' }}
          >
            <Icon type="plus" /> New Tag
          </Tag>
        )}
      </div>
    )
  }
}

EditableTagGroup.propTypes = {
  onChange: PropTypes.func,
  tagOptions: PropTypes.array,
  tags: PropTypes.array
}

EditableTagGroup.defaultProps = {
  onChange: () => {},
  tagOptions: [],
  tags: []
}

export default EditableTagGroup
