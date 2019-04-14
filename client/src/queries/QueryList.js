import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import List from 'antd/lib/list';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import Tooltip from 'antd/lib/tooltip';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import { Link } from 'react-router-dom';
import Popconfirm from 'antd/lib/popconfirm';
import getAvailableSearchTags from './getAvailableSearchTags';
import getDecoratedQueries from './getDecoratedQueries';

const { Option } = Select;

// TODO FIXME XXX show formatted query as preview

function QueryList({
  queries,
  loadQueries,
  connections,
  deleteQuery,
  onSelect
}) {
  const [preview, setPreview] = useState('');
  const [searches, setSearches] = useState([]);
  useEffect(() => {
    loadQueries();
  }, []);

  const availableSearches = getAvailableSearchTags(queries, connections);
  const decoratedQueries = getDecoratedQueries(queries, connections);

  let filteredQueries = decoratedQueries;
  if (searches && searches.length) {
    searches.forEach(search => {
      if (search.startsWith('createdBy=')) {
        const createdBy = search.substring(10);
        filteredQueries = filteredQueries.filter(
          query => query.createdBy === createdBy
        );
      } else if (search.startsWith('tag=')) {
        const sTag = search.substring(4);
        filteredQueries = filteredQueries.filter(
          query => query.tags && query.tags.includes(sTag)
        );
      } else if (search.startsWith('connection=')) {
        const connectionName = search.substring(11);
        filteredQueries = filteredQueries.filter(
          query => query.connectionName === connectionName
        );
      } else {
        // search is just open text search
        const lowerSearch = search.toLowerCase();
        filteredQueries = filteredQueries.filter(q => {
          return (
            (q.name && q.name.toLowerCase().search(lowerSearch) !== -1) ||
            (q.queryText &&
              q.queryText.toLowerCase().search(lowerSearch) !== -1)
          );
        });
      }
    });
  }

  const renderItem = query => {
    const tableUrl = `/query-table/${query._id}`;
    const chartUrl = `/query-chart/${query._id}`;
    const queryUrl = `/queries/${query._id}`;

    return (
      <List.Item
        className="bg-animate hover-bg-near-white"
        onMouseEnter={() => setPreview(query)}
        onMouseLeave={() => setPreview('')}
        actions={[
          <Tooltip key="edit" title="Edit query">
            <Link
              className="ant-btn ant-btn-icon-only"
              to={queryUrl}
              onClick={() => {
                onSelect(query);
              }}
            >
              <Icon type="edit" />
            </Link>
          </Tooltip>,
          <Tooltip key="table" title="Open results in new window">
            <Link
              className="ant-btn ant-btn-icon-only"
              to={tableUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon type="table" />
            </Link>
          </Tooltip>,
          <Tooltip key="chart" title="Open chart in new window">
            <Link
              className="ant-btn ant-btn-icon-only"
              to={chartUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon type="bar-chart" />
            </Link>
          </Tooltip>,
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
        <List.Item.Meta title={query.name} description={query.connectionName} />
      </List.Item>
    );
  };

  return (
    <>
      <Row>
        <Col className="pb3" span={24}>
          <Select
            autoFocus
            className="w-100"
            mode="tags"
            placeholder="Search"
            value={searches}
            onChange={value => setSearches(value)}
          >
            {availableSearches.map(search => (
              <Option key={search}>{search}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <List
        size="small"
        itemLayout="horizontal"
        dataSource={filteredQueries}
        renderItem={renderItem}
      />
      {preview && (
        <div
          className="shadow-2 pa2"
          style={{
            position: 'fixed',
            left: 640,
            top: 40,
            right: 40,
            bottom: 40,
            backgroundColor: 'white'
          }}
        >
          <pre>{JSON.stringify(preview, null, 2)}</pre>
        </div>
      )}
    </>
  );
}

QueryList.propTypes = {
  queries: PropTypes.array,
  onSelect: PropTypes.func
};

export default connect(
  ['queries', 'connections'],
  actions
)(React.memo(QueryList));
