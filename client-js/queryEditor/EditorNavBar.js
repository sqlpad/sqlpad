import React from 'react'
import PropTypes from 'prop-types'
import Navbar from 'react-bootstrap/lib/Navbar'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'

import Icon from 'antd/lib/icon'

import Radio from 'antd/lib/radio'
import 'antd/lib/radio/style/css'

import Form from 'antd/lib/form'
import 'antd/lib/form/style/css'

import Input from 'antd/lib/input'
import 'antd/lib/input/style/css'

import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'

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

    console.log('activeTabKey ', activeTabKey)

    return (
      <Navbar fluid>
        <Nav>
          <Radio.Group
            className="mt3"
            value={activeTabKey}
            onChange={onTabSelect}
          >
            <Radio.Button value="sql">
              <Icon type="code-o" /> SQL
            </Radio.Button>
            <Radio.Button value="vis">
              <Icon type="bar-chart" /> Vis
            </Radio.Button>
          </Radio.Group>
        </Nav>

        <Nav>
          <NavItem
            eventKey={1}
            href="#"
            onClick={onCloneClick}
            disabled={cloneDisabled}
          >
            Clone
          </NavItem>
          <NavItem eventKey={2} href="#" onClick={onFormatClick}>
            Format
          </NavItem>
          <NavItem
            style={{ minWidth: 68 }}
            eventKey={3}
            href="#"
            onClick={onSaveClick}
            disabled={isSaving}
          >
            {saveText}
          </NavItem>
          <NavItem
            eventKey={4}
            href="#"
            onClick={onRunClick}
            disabled={isRunning}
          >
            Run
          </NavItem>
        </Nav>
        <Navbar.Form>
          <FormItem className="ml4 dib" validateStatus={validationState}>
            <Input
              style={{
                width: 300,
                color: '#111',
                padding: '5px 12px',
                fontSize: '16px',
                display: 'inline-block'
              }}
              placeholder="Query name"
              value={query.name}
              onChange={this.onQueryNameChange}
            />
          </FormItem>
          <Button className="ml2 mt1" onClick={onMoreClick}>
            &hellip;
          </Button>
        </Navbar.Form>
      </Navbar>
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
