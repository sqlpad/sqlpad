import React from 'react'
import Navbar from 'react-bootstrap/lib/Navbar'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import Button from 'react-bootstrap/lib/Button'

class QueryEditor extends React.Component {
  render() {
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
      <Navbar fluid>
        <Nav activeKey={activeTabKey} bsStyle="pills" onSelect={onTabSelect}>
          <NavItem eventKey="sql">
            <span className="glyphicon glyphicon-align-left" /> SQL
          </NavItem>
          <NavItem eventKey="vis">
            <span className="glyphicon glyphicon-stats" /> Vis
          </NavItem>
        </Nav>
        <Navbar.Form>
          <Button
            className="QueryEditorSubheaderItem"
            onClick={onSaveClick}
            disabled={isSaving}
          >
            {isSaving ? 'Saving' : 'Save'}
          </Button>
          <Button
            className="QueryEditorSubheaderItem"
            onClick={onRunClick}
            disabled={isRunning}
          >
            {isRunning ? 'Running' : 'Run'}
          </Button>
          <ControlLabel
            onClick={onQueryNameClick}
            className="QueryEditorSubheaderItem QueryEditorQueryName"
          >
            {queryName || '(click to name query)'}
          </ControlLabel>
        </Navbar.Form>
      </Navbar>
    )
  }
}

export default QueryEditor
