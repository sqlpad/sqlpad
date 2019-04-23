import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import Typography from 'antd/lib/typography';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Spin from 'antd/lib/spin';
import React, { useEffect, useState } from 'react';
import Measure from 'react-measure';
import { FixedSizeList as List } from 'react-window';
import { connect } from 'unistore/react';
import Sidebar from '../common/Sidebar';
import { actions } from '../stores/unistoreStore';
import styles from './SchemaSidebar.module.css';
import searchSchemaInfo from './searchSchemaInfo';
import getSchemaList from './getSchemaList';

const { Text } = Typography;

function mapStateToProps(state, props) {
  const { loading, schemaInfo, expanded } =
    (state.schema && state.schema[state.selectedConnectionId]) || {};
  return {
    expanded,
    connectionId: state.selectedConnectionId,
    schemaInfo: schemaInfo || {},
    loading
  };
}

function SchemaSidebar({
  expanded,
  connectionId,
  loadSchemaInfo,
  schemaInfo,
  loading,
  toggleSchemaItem
}) {
  const [search, setSearch] = useState('');
  const [dimensions, setDimensions] = useState({
    width: -1,
    height: -1
  });

  // Load schema on connection changes
  useEffect(() => {
    if (connectionId) {
      loadSchemaInfo(connectionId);
    }
  }, [connectionId, loadSchemaInfo]);

  const handleRefreshClick = e => {
    e.preventDefault();
    if (connectionId) {
      loadSchemaInfo(connectionId, true);
    }
  };

  const filteredSchemaInfo = searchSchemaInfo(schemaInfo, search);
  const schemaList = getSchemaList(filteredSchemaInfo);

  // For windowed list rendering, we need to determine what is visible due to expanded parent
  // Show item if every parent is expanded (or doesn't have a parent)
  const visibleItems = schemaList.filter(row =>
    row.parentIds.every(id => expanded[id])
  );

  const Row = ({ index, style }) => {
    const row = visibleItems[index];
    const iconType = expanded[row.id] ? 'caret-down' : 'caret-right';
    if (!row) {
      return null;
    }
    if (row.type === 'schema') {
      return (
        <li
          key={row.name}
          className={styles.schema}
          style={style}
          onClick={() => toggleSchemaItem(connectionId, row)}
        >
          <Icon type={iconType} /> {row.name}
        </li>
      );
    }
    if (row.type === 'table') {
      return (
        <li
          key={`${row.schemaName}.${row.name}`}
          className={styles.table}
          style={style}
          onClick={() => toggleSchemaItem(connectionId, row)}
        >
          <Icon type={iconType} /> {row.name}
        </li>
      );
    }
    if (row.type === 'column') {
      let secondary = ` ${row.dataType}`;
      if (row.description) {
        secondary += ` - ${row.description}`;
      }
      return (
        <li
          key={`${row.schemaName}.${row.tableName}.${row.name}`}
          className={styles.column}
          style={style}
        >
          {row.name}
          <Text type="secondary">{secondary}</Text>
        </li>
      );
    }
  };

  return (
    <Measure
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds);
      }}
    >
      {({ measureRef }) => (
        <Sidebar>
          <div style={{ display: 'flex' }}>
            <Input
              value={search}
              placeholder="Search schema"
              onChange={event => setSearch(event.target.value)}
            />
            <Tooltip title="Refresh schema">
              <Button
                icon="reload"
                style={{ marginLeft: 8 }}
                disabled={loading}
                onClick={handleRefreshClick}
              />
            </Tooltip>
          </div>
          <div>
            <Divider style={{ margin: '8px 0' }} />
          </div>
          <div
            style={{
              display: 'flex',
              flexGrow: 1
            }}
          >
            <div
              ref={measureRef}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%'
              }}
            >
              {loading ? (
                <Spin
                  spinning={loading}
                  className={styles.schemaSpinner}
                  delay={150}
                />
              ) : (
                <ul style={{ paddingLeft: 0 }}>
                  <List
                    height={dimensions.height}
                    itemCount={visibleItems.length}
                    itemSize={22}
                    width={dimensions.width}
                    overscanCount={10}
                  >
                    {Row}
                  </List>
                </ul>
              )}
            </div>
          </div>
        </Sidebar>
      )}
    </Measure>
  );
}

export default connect(
  mapStateToProps,
  actions
)(React.memo(SchemaSidebar));
