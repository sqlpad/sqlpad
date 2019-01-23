import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Radio from 'antd/lib/radio'
import PropTypes from 'prop-types'
import React from 'react'
import ConnectionDropDown from './ConnectionDropdown'

const FormItem = Form.Item

class EditorNavBar extends React.Component {
  onQueryNameChange = e => {
    this.props.onQueryNameChange(e.target.value)
  }

  render() {
    const {
      activeTabKey,
      onTabSelect,
      isSaving,
      isRunning,
      onCloneClick,
      onMoreClick,
      onSaveClick,
      onRunClick,
      onFormatClick,
      query,
      showValidation,
      unsavedChanges
    } = this.props

    const validationState =
      showValidation && !query.name.length ? 'error' : null
    const saveText = unsavedChanges ? 'Save*' : 'Save'
    const cloneDisabled = !query._id

    return (
      <div className="w-100 bg-near-white ph2 pv1 bb b--light-gray">
        <Form layout="inline">
          <FormItem>
            <ConnectionDropDown />
          </FormItem>
          <FormItem>
            <Radio.Group value={activeTabKey} onChange={onTabSelect}>
              <Radio.Button value="sql">
                <Icon type="code-o" /> SQL
              </Radio.Button>
              <Radio.Button value="vis">
                <Icon type="bar-chart" /> Vis
              </Radio.Button>
            </Radio.Group>
          </FormItem>
          <FormItem>
            <Button.Group>
              <Button onClick={onCloneClick} disabled={cloneDisabled}>
                Clone
              </Button>
              <Button onClick={onFormatClick}>Format</Button>
              <Button
                style={{ minWidth: 75 }}
                onClick={onSaveClick}
                disabled={isSaving}
              >
                {saveText}
              </Button>
              <Button type="primary" onClick={onRunClick} disabled={isRunning}>
                Run
              </Button>
            </Button.Group>
          </FormItem>
          <FormItem validateStatus={validationState}>
            <Input
              className="w5"
              placeholder="Query name"
              value={query.name}
              onChange={this.onQueryNameChange}
            />
          </FormItem>
          <FormItem>
            <Button onClick={onMoreClick}>&hellip;</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}

EditorNavBar.propTypes = {
  activeTabKey: PropTypes.string.isRequired,
  onTabSelect: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isRunning: PropTypes.bool.isRequired,
  onCloneClick: PropTypes.func.isRequired,
  onMoreClick: PropTypes.func.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onRunClick: PropTypes.func.isRequired,
  onFormatClick: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
  showValidation: PropTypes.bool.isRequired,
  unsavedChanges: PropTypes.bool.isRequired
}

export default EditorNavBar
