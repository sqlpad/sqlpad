import React from 'react'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import Form from 'react-bootstrap/lib/Form'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'

class QueryEditor extends React.Component {
  render () {
    const {
      activeTabKey,
      onTabSelect,
      isSaving,
      isRunning,
      onQueryNameClick,
      onSaveClick,
      onRunClick,
      queryName
    } = this.props

    return (
      <div className='clearfix navbar-default'>
        <Nav
          activeKey={activeTabKey}
          bsStyle='pills'
          className='navbar-left'
          style={{ paddingLeft: 6, marginTop: 6 }}
          onSelect={onTabSelect}
        >
          <NavItem eventKey='sql'>
            <span className='glyphicon glyphicon-align-left' /> SQL
          </NavItem>
          <NavItem eventKey='vis'>
            <span className='glyphicon glyphicon-stats' /> Vis
          </NavItem>
        </Nav>
        <Form inline className='navbar-form'>
          <Button
            className='QueryEditorSubheaderItem'
            onClick={onSaveClick}
            disabled={isSaving}
          >
            {isSaving ? 'Saving' : 'Save'}
          </Button>
          <Button
            className='QueryEditorSubheaderItem'
            onClick={onRunClick}
            disabled={isRunning}
          >
            {isRunning ? 'Running' : 'Run'}
          </Button>
          <ControlLabel
            onClick={onQueryNameClick}
            className='QueryEditorSubheaderItem QueryEditorQueryName'
          >
            {queryName || '(click to name query)'}
          </ControlLabel>
        </Form>
      </div>
    )
  }
}

export default QueryEditor
