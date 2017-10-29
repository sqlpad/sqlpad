import React from 'react'
import { Link } from 'react-router-dom'
import Label from 'react-bootstrap/lib/Label'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import Popover from 'react-bootstrap/lib/Popover'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'

class QueryListRow extends React.Component {
  state = {
    showPreview: false
  }

  onMouseOver = e => {
    this.props.handleQueryListRowMouseOver(this.props.query)
  }

  onDelete = e => {
    this.props.handleQueryDelete(this.props.query._id)
  }

  render() {
    var tagLabels = this.props.query.tags.map(tag => {
      return (
        <Label bsStyle="info" key={tag} style={{ marginLeft: 4 }}>
          {tag}
        </Label>
      )
    })
    var tableUrl =
      this.props.config.baseUrl + '/query-table/' + this.props.query._id
    var chartUrl =
      this.props.config.baseUrl + '/query-chart/' + this.props.query._id
    var selectedStyle = () => {
      if (
        this.props.selectedQuery &&
        this.props.selectedQuery._id === this.props.query._id
      ) {
        return 'list-group-item QueryListRow QueryListRowSelected'
      } else {
        return 'list-group-item QueryListRow'
      }
    }
    const popoverClick = (
      <Popover id="popover-trigger-click" title="Are you sure?">
        <Button
          bsStyle="danger"
          onClick={this.onDelete}
          style={{ width: '100%' }}
        >
          delete
        </Button>
      </Popover>
    )
    return (
      <li
        onClick={this.onClick}
        className={selectedStyle()}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <h4>
          <Link to={'/queries/' + this.props.query._id}>
            {this.props.query.name}
          </Link>
        </h4>
        <p>
          {this.props.query.createdBy} {tagLabels}
        </p>
        <p>
          <a href={tableUrl} target="_blank" rel="noopener noreferrer">
            table
          </a>{' '}
          <a href={chartUrl} target="_blank" rel="noopener noreferrer">
            chart
          </a>
        </p>
        <OverlayTrigger
          trigger="click"
          placement="left"
          container={this}
          rootClose
          overlay={popoverClick}
        >
          <a className="QueryListRowDeleteButton" href="#delete">
            <Glyphicon glyph="trash" />
          </a>
        </OverlayTrigger>
      </li>
    )
  }
}

export default QueryListRow
