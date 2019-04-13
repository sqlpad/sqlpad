import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import List from 'antd/lib/list';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import Sidebar from '../common/Sidebar';
import { Link, Route } from 'react-router-dom';
import Popconfirm from 'antd/lib/popconfirm';

function QueriesSidebar({ queries, loadQueries, connections, deleteQuery }) {
  useEffect(() => {
    loadQueries();
  }, []);

  // Create index of lookups
  // TODO this should come from API
  const connectionsById = connections.reduce((connMap, connection) => {
    connMap[connection._id] = connection;
    return connMap;
  }, {});

  const decoratedQueries = queries.map(query => {
    query.key = query._id;

    const connection = connectionsById[query.connectionId];
    query.connectionName = connection ? connection.name : '';

    return query;
  });

  const renderItem = query => {
    const tableUrl = `/query-table/${query._id}`;
    const chartUrl = `/query-chart/${query._id}`;
    const queryUrl = `/queries/${query._id}`;

    const menu = (
      <Menu>
        <Menu.Item>
          <Link
            key="table"
            to={tableUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon type="link" /> table
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link
            key="chart"
            to={chartUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon type="link" /> chart
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Route
        render={({ history }) => {
          return (
            <Dropdown overlay={menu} trigger={['contextMenu']}>
              <List.Item
                className="pointer pa2 bg-animate hover-bg-lightest-blue"
                onClick={() => history.push(queryUrl)}
                actions={[
                  <Popconfirm
                    key="del"
                    title="Are you sure?"
                    onConfirm={e => deleteQuery(query._id)}
                    onCancel={() => {}}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button icon="delete" type="danger" />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={query.name}
                  description={query.connectionName}
                />
              </List.Item>
            </Dropdown>
          );
        }}
      />
    );
  };

  return (
    <Sidebar>
      <div className="flex-auto overflow-x-hidden overflow-y-auto">
        <List
          size="small"
          itemLayout="horizontal"
          // bordered
          dataSource={decoratedQueries}
          renderItem={renderItem}
        />
      </div>
    </Sidebar>
  );
}

QueriesSidebar.propTypes = {
  queries: PropTypes.array
};

export default connect(
  ['queries', 'connections'],
  actions
)(React.memo(QueriesSidebar));
