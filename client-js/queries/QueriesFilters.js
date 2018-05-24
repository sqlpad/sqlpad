import React from 'react'
import Form from 'react-bootstrap/lib/Form'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'

class QueriesFilters extends React.Component {
  onSearchChange = e => {
    this.props.onSearchChange(e.target.value)
  }

  onConnectionChange = e => {
    this.props.onConnectionChange(e.target.value)
  }

  onTagChange = e => {
    this.props.onTagChange(e.target.value)
  }

  onCreatedByChange = e => {
    this.props.onCreatedByChange(e.target.value)
  }

  render() {
    var connectionSelectOptions = this.props.connections.map(function(conn) {
      return (
        <option key={conn._id} value={conn._id}>
          {conn.name}
        </option>
      )
    })
    var createdBySelectOptions = this.props.createdBys.map(function(createdBy) {
      return (
        <option key={createdBy} value={createdBy}>
          {createdBy}
        </option>
      )
    })
    var tagSelectOptions = this.props.tags.map(function(tag) {
      return (
        <option key={tag} value={tag}>
          {tag}
        </option>
      )
    })
    return (
      <div className="pa2 w-100">
        <Form className="flex w-100">
          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Search</ControlLabel>
            <FormControl type="text" onChange={this.onSearchChange} />
          </FormGroup>

          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Tag</ControlLabel>
            <FormControl componentClass="select" onChange={this.onTagChange}>
              <option value="">All</option>
              {tagSelectOptions}
            </FormControl>
          </FormGroup>

          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Connection</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={this.onConnectionChange}
            >
              <option value="">All</option>
              {connectionSelectOptions}
            </FormControl>
          </FormGroup>

          <FormGroup className="pa2 w-20" controlId="formControlsSelect">
            <ControlLabel>Created By</ControlLabel>
            <FormControl
              value={this.props.selectedCreatedBy}
              componentClass="select"
              onChange={this.onCreatedByChange}
            >
              <option value="">All</option>
              {createdBySelectOptions}
            </FormControl>
          </FormGroup>
        </Form>
      </div>
    )
  }
}

export default QueriesFilters
