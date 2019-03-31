import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import Sidebar from '../common/Sidebar';
import SidebarBody from '../common/SidebarBody';
import { ConnectionsContext } from '../stores/ConnectionsStore';
import fetchJson from '../utilities/fetch-json.js';
import updateCompletions from '../utilities/updateCompletions.js';

const SchemaSidebarContainer = props => {
  return (
    <ConnectionsContext.Consumer>
      {context => (
        <SchemaSidebar {...props} connectionId={context.selectedConnectionId} />
      )}
    </ConnectionsContext.Consumer>
  );
};

class SchemaSidebar extends React.PureComponent {
  state = {
    schemaInfo: {},
    loading: false
  };

  componentDidMount() {
    const { connectionId } = this.props;
    if (connectionId) {
      this.getSchemaInfo(connectionId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.connectionId !== nextProps.connectionId) {
      this.getSchemaInfo(nextProps.connectionId);
    }
  }

  getSchemaInfo = (connectionId, reload) => {
    if (connectionId) {
      this.setState({
        schemaInfo: {},
        loading: true
      });
      const qs = reload ? '?reload=true' : '';
      fetchJson('GET', `/api/schema-info/${connectionId}${qs}`).then(json => {
        const { error, schemaInfo } = json;
        if (error) {
          console.error(error);
        }
        updateCompletions(schemaInfo);
        this.setState({
          schemaInfo: schemaInfo
        });
        // sometimes refreshes happen so fast and people don't get to enjoy the animation
        setTimeout(() => {
          this.setState({ loading: false });
        }, 1000);
      });
    } else {
      this.setState({
        schemaInfo: {}
      });
    }
  };

  handleRefreshClick = e => {
    e.preventDefault();
    this.getSchemaInfo(this.props.connectionId, true);
  };

  render() {
    const { loading, schemaInfo } = this.state;
    const refreshClass = loading ? 'spinning' : '';

    const schemaCount = schemaInfo ? Object.keys(schemaInfo).length : 0;
    const initShowTables = schemaCount <= 2;
    const schemaItemNodes = schemaInfo
      ? Object.keys(schemaInfo).map(schema => {
          return (
            <SchemaInfoSchemaItem
              {...this.props}
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
                  onClick={this.handleRefreshClick}
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

export default SchemaSidebarContainer;
