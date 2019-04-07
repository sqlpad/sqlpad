import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import React, { useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import CopyToClipboard from 'react-copy-to-clipboard';
import Sidebar from '../common/Sidebar';
import SidebarBody from '../common/SidebarBody';

function mapStateToProps(state, props) {
  return {
    config: state.config,
    connectionId: state.selectedConnectionId,
    schemaInfo:
      state.schema &&
      state.schema[state.selectedConnectionId] &&
      state.schema[state.selectedConnectionId].schemaInfo,
    loading:
      state.schema &&
      state.schema[state.selectedConnectionId] &&
      state.schema[state.selectedConnectionId].loading
  };
}

function SchemaSidebar({
  config,
  connectionId,
  loadSchemaInfo,
  schemaInfo,
  loading
}) {
  useEffect(() => {
    if (connectionId) {
      loadSchemaInfo(connectionId);
    }
  }, [connectionId]);

  const handleRefreshClick = e => {
    e.preventDefault();
    if (connectionId) {
      loadSchemaInfo(connectionId, true);
    }
  };

  const refreshClass = loading ? 'spinning' : '';

  const schemaCount = schemaInfo ? Object.keys(schemaInfo).length : 0;
  const initShowTables = schemaCount <= 2;
  const schemaItemNodes = schemaInfo
    ? Object.keys(schemaInfo).map(schema => {
        return (
          <SchemaInfoSchemaItem
            config={config}
            initShowTables={initShowTables}
            key={schema}
            schema={schema}
            tables={schemaInfo[schema]}
          />
        );
      })
    : null;

  return (
    <Sidebar>
      <SidebarBody>
        <div style={{ position: 'relative' }}>
          <a style={{ position: 'absolute', right: '20px' }} href="#refresh">
            <Tooltip title="Refresh schema">
              <Icon
                type="reload"
                className={' ' + refreshClass}
                onClick={handleRefreshClick}
              />
            </Tooltip>
          </a>
          <ul className="pl0 dib" style={{ minWidth: '230px' }}>
            {schemaItemNodes}
          </ul>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

class SchemaInfoSchemaItem extends React.Component {
  state = {
    showTables: this.props.initShowTables
  };

  handleClick = e => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      showTables: !this.state.showTables
    });
  };

  render() {
    const { showTables } = this.state;
    const { schema, tables } = this.props;
    let tableJsx;
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
        );
      });
    }
    return (
      <li className="list" key={schema}>
        <a
          href="#schema"
          onClick={this.handleClick}
          className="dib"
          style={{ minWidth: '230px' }}
        >
          {schema}
        </a>
        <ul className="pl3">{tableJsx}</ul>
      </li>
    );
  }
}

class SchemaInfoTableItem extends React.Component {
  state = {
    showColumns: false,
    showCopyButton: false,
    copyButtonText: 'copy'
  };

  handleClick = e => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({
      showColumns: !this.state.showColumns
    });
  };

  handleMouseOver = e => {
    this.setState({
      showCopyButton: true
    });
  };

  handleMouseOut = e => {
    this.setState({
      showCopyButton: false
    });
  };

  handleCopyClick = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  handleCopy = e => {
    this.setState({ copyButtonText: 'copied' });
    setTimeout(() => {
      this.setState({ copyButtonText: 'copy' });
    }, 2000);
  };

  render() {
    const { columns, config, schema, table } = this.props;
    const { showColumns, showCopyButton, copyButtonText } = this.state;
    let columnJsx;
    if (showColumns) {
      columnJsx = columns.map(column => {
        if (column.column_name) {
          return (
            <SchemaInfoColumnItem
              {...this.props}
              column_name={column.column_name}
              data_type={column.data_type}
              column_description={column.column_description}
              key={column.column_name}
              schema={schema}
              table={table}
            />
          );
        } else {
          return (
            <SchemaInfoColumnItem
              {...this.props}
              column_name={column.COLUMN_NAME}
              data_type={column.DATA_TYPE}
              key={column.COLUMN_NAME}
              schema={schema}
              table={table}
            />
          );
        }
      });
    }

    const copyButtonClassName = showCopyButton
      ? 'right-2 pointer absolute bg-black hover-bg-hot-pink label'
      : 'right-2 pointer absolute bg-black hover-bg-hot-pink label dn';
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
        );
      }
    };
    return (
      <li className="list" key={table}>
        <a
          href="#schema"
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          onClick={this.handleClick}
          className="dib"
          style={{ minWidth: '230px' }}
        >
          {table}
          {getCopyToClipboard()}
        </a>
        <ul className="pl3">{columnJsx}</ul>
      </li>
    );
  }
}

class SchemaInfoColumnItem extends React.Component {
  state = {
    showCopyButton: false,
    copyButtonText: 'copy'
  };

  handleMouseOver = e => {
    this.setState({
      showCopyButton: true
    });
  };

  handleMouseOut = e => {
    this.setState({
      showCopyButton: false
    });
  };

  handleCopyClick = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  handleCopy = () => {
    this.setState({ copyButtonText: 'copied' });
    setTimeout(() => {
      this.setState({ copyButtonText: 'copy' });
    }, 2000);
  };

  render() {
    const { copyButtonText, showCopyButton } = this.state;
    const {
      config,
      column_name,
      data_type,
      column_description,
      schema,
      table
    } = this.props;
    const copyButtonClassName = showCopyButton
      ? 'right-2 pointer absolute bg-black hover-bg-hot-pink label label-info'
      : 'right-2 pointer absolute bg-black hover-bg-hot-pink label label-info dn';
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
        );
      }
    };

    const description = column_description && ` - ${column_description}`;
    return (
      <li className="list">
        <span
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          className="dib"
          style={{ minWidth: '230px' }}
        >
          {column_name}
          <span className="silver"> ({data_type})</span>
          {description}
          {getCopyToClipboard()}
        </span>
      </li>
    );
  }
}

export default connect(
  mapStateToProps,
  actions
)(React.memo(SchemaSidebar));
