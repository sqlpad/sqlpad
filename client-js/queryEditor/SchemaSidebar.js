import React from 'react'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import CopyToClipboard from 'react-copy-to-clipboard'
import fetchJson from '../utilities/fetch-json.js'
import updateCompletions from '../utilities/updateCompletions.js'
import './SchemaSidebar.css'

class SchemaSidebar extends React.PureComponent {
  state = {
    schemaInfo: {},
    loading: false
  }

  componentDidMount() {
    const { connectionId } = this.props
    if (connectionId) {
      this.getSchemaInfo(connectionId)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.connectionId !== nextProps.connectionId) {
      this.getSchemaInfo(nextProps.connectionId)
    }
  }

  getSchemaInfo = (connectionId, reload) => {
    if (connectionId) {
      this.setState({
        schemaInfo: {},
        loading: true
      })
      const qs = reload ? '?reload=true' : ''
      fetchJson('GET', `/api/schema-info/${connectionId}${qs}`).then(json => {
        const { error, schemaInfo } = json
        if (error) {
          console.error(error)
        }
        updateCompletions(schemaInfo)
        this.setState({
          schemaInfo: schemaInfo
        })
        // sometimes refreshes happen so fast and people don't get to enjoy the animation
        setTimeout(() => {
          this.setState({ loading: false })
        }, 1000)
      })
    } else {
      this.setState({
        schemaInfo: {}
      })
    }
  }

  handleConnectionChange = e => {
    const connectionId = e.target.value
    this.props.onConnectionChange(connectionId)
    this.getSchemaInfo(connectionId)
  }

  handleRefreshClick = e => {
    e.preventDefault()
    this.getSchemaInfo(this.props.connectionId, true)
  }

  render() {
    const { connections, connectionId } = this.props
    const { loading, schemaInfo } = this.state
    const connectionSelectOptions = connections.map(function(conn) {
      return (
        <option key={conn._id} value={conn._id}>
          {conn.name}
        </option>
      )
    })
    const refreshClass = loading ? 'spinning' : ''

    const schemaCount = schemaInfo ? Object.keys(schemaInfo).length : 0
    const initShowTables = schemaCount <= 2
    const schemaItemNodes = Object.keys(schemaInfo).map(schema => {
      return (
        <SchemaInfoSchemaItem
          {...this.props}
          initShowTables={initShowTables}
          key={schema}
          schema={schema}
          tables={schemaInfo[schema]}
        />
      )
    })

    return (
      <div className="sidebar">
        <div className="sidebar-body">
          <FormGroup controlId="formControlsSelect" bsSize="small">
            <FormControl
              value={connectionId}
              componentClass="select"
              onChange={this.handleConnectionChange}
              className="input-small"
            >
              <option value="">Choose a connection...</option>
              {connectionSelectOptions}
            </FormControl>
          </FormGroup>
          <hr />
          <div style={{ position: 'relative' }}>
            <a style={{ position: 'absolute', right: '20px' }} href="#refresh">
              <Glyphicon
                glyph="refresh"
                className={refreshClass}
                onClick={this.handleRefreshClick}
              />
            </a>
            <ul className="schema-info schema-info-table">{schemaItemNodes}</ul>
          </div>
        </div>
      </div>
    )
  }
}

class SchemaInfoSchemaItem extends React.Component {
  state = {
    showTables: this.props.initShowTables
  }

  handleClick = e => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      showTables: !this.state.showTables
    })
  }

  render() {
    const { showTables } = this.state
    const { schema, tables } = this.props
    let tableJsx
    if (showTables) {
      tableJsx = Object.keys(tables).map(table => {
        return (
          <SchemaInfoTableItem
            {...this.props}
            key={table}
            schema={schema}
            table={table}
            columns={tables[table]}
          />
        )
      })
    }
    return (
      <li key={schema}>
        <a
          href="#schema"
          onClick={this.handleClick}
          className="schema-info-schema"
        >
          {schema}
        </a>
        <ul>{tableJsx}</ul>
      </li>
    )
  }
}

class SchemaInfoTableItem extends React.Component {
  state = {
    showColumns: false,
    showCopyButton: false,
    copyButtonText: 'copy'
  }

  handleClick = e => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      showColumns: !this.state.showColumns
    })
  }

  handleMouseOver = e => {
    this.setState({
      showCopyButton: true
    })
  }

  handleMouseOut = e => {
    this.setState({
      showCopyButton: false
    })
  }

  handleCopyClick = e => {
    e.stopPropagation()
  }

  handleCopy = () => {
    this.setState({ copyButtonText: 'copied' })
    setTimeout(() => {
      this.setState({ copyButtonText: 'copy' })
    }, 2000)
  }

  render() {
    const { columns, config, schema, table } = this.props
    const { showColumns, showCopyButton, copyButtonText } = this.state
    let columnJsx
    if (showColumns) {
      columnJsx = columns.map(column => {
        return (
          <SchemaInfoColumnItem
            {...this.props}
            column_name={column.column_name}
            data_type={column.data_type}
            key={column.column_name}
            schema={schema}
            table={table}
          />
        )
      })
    }
    // this is hacky, but because of the way we're passing the schema info around
    // we need to reach down into the columns to get the type of this object
    const viewType = () => {
      const type = columns[0].table_type
      if (type.toLowerCase().split('')[0] === 'v') {
        return <span className="schema-additional-context"> (view)</span>
      }
    }

    const copyButtonClassName = showCopyButton
      ? 'copy-button label'
      : 'copy-button label hidden'
    const getCopyToClipboard = () => {
      if (config && config.showSchemaCopyButton) {
        return (
          <CopyToClipboard text={schema + '.' + table} onCopy={this.handleCopy}>
            <span
              id="path-tooltip"
              onClick={this.handleCopyClick}
              className={copyButtonClassName}
            >
              {copyButtonText}
            </span>
          </CopyToClipboard>
        )
      }
    }
    return (
      <li key={table}>
        <a
          href="#schema"
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          onClick={this.handleClick}
          className="schema-info-table"
        >
          {table} {viewType()}
          {getCopyToClipboard()}
        </a>
        <ul>{columnJsx}</ul>
      </li>
    )
  }
}

class SchemaInfoColumnItem extends React.Component {
  state = {
    showCopyButton: false,
    copyButtonText: 'copy'
  }

  handleMouseOver = e => {
    this.setState({
      showCopyButton: true
    })
  }

  handleMouseOut = e => {
    this.setState({
      showCopyButton: false
    })
  }

  handleCopyClick = e => {
    e.stopPropagation()
    e.preventDefault()
  }

  handleCopy = () => {
    this.setState({ copyButtonText: 'copied' })
    setTimeout(() => {
      this.setState({ copyButtonText: 'copy' })
    }, 2000)
  }

  render() {
    const { copyButtonText, showCopyButton } = this.state
    const { config, column_name, data_type, schema, table } = this.props
    const copyButtonClassName = showCopyButton
      ? 'copy-button label label-info'
      : 'copy-button label label-info hidden'
    const getCopyToClipboard = () => {
      if (config && config.showSchemaCopyButton) {
        return (
          <CopyToClipboard
            text={`${schema}.${table}.${column_name}`}
            onCopy={this.handleCopy}
          >
            <span
              id="path-tooltip"
              onClick={this.handleCopyClick}
              className={copyButtonClassName}
            >
              {copyButtonText}
            </span>
          </CopyToClipboard>
        )
      }
    }
    return (
      <li>
        <span
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          className="schema-info-column"
        >
          {column_name}
          <span className="schema-additional-context"> ({data_type})</span>
          {getCopyToClipboard()}
        </span>
      </li>
    )
  }
}

export default SchemaSidebar
