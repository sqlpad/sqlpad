import { Col, Row } from 'antd';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Layout from 'antd/lib/layout';
import Popconfirm from 'antd/lib/popconfirm';
import Popover from 'antd/lib/popover';
import Select from 'antd/lib/select';
import Table from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import uniq from 'lodash/uniq';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import { Link } from 'react-router-dom';
import SqlEditor from '../common/SqlEditor';

const { Content } = Layout;

const { Option } = Select;
const { Column } = Table;
const { Search } = Input;

function QueriesView({
  currentUser,
  queries,
  loadQueries,
  loadConnections,
  connections,
  deleteQuery
}) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState(
    currentUser ? currentUser.email : ''
  );

  const createdBys = uniq(queries.map(q => q.createdBy));
  const tags = uniq(
    queries
      .map(q => q.tags)
      .reduce((a, b) => a.concat(b), [])
      .filter(tag => tag)
  );

  const onSearchChange = e => setSearchInput(e.target.value);

  useEffect(() => {
    document.title = 'SQLPad - Queries';
    loadConnections();
    loadQueries();
  }, []);

  const nameRender = (text, record) => {
    return <Link to={'/queries/' + record._id}>{record.name}</Link>;
  };

  const previewRender = (text, record) => {
    return (
      <Popover
        content={
          <div style={{ width: '600px', height: '300px' }}>
            <SqlEditor readOnly value={record.queryText} />
          </div>
        }
        placement="right"
        title={record.name}
        trigger="hover"
      >
        <Icon type="code-o" />
      </Popover>
    );
  };

  const nameSorter = (a, b) => a.name.localeCompare(b.name);

  const modifiedSorter = (a, b) => {
    return moment(a.modifiedDate).toDate() - moment(b.modifiedDate).toDate();
  };

  const modifiedRender = (text, record) =>
    moment(record.modifiedDate).calendar();

  const tagsRender = (text, record) => {
    if (record.tags && record.tags.length) {
      return record.tags.map(tag => <Tag key={tag}>{tag}</Tag>);
    }
  };

  const actionsRender = (text, record) => {
    const tableUrl = `/query-table/${record._id}`;
    const chartUrl = `/query-chart/${record._id}`;
    return (
      <span>
        <Link to={tableUrl} target="_blank" rel="noopener noreferrer">
          table
        </Link>
        <Divider type="vertical" />
        <Link to={chartUrl} target="_blank" rel="noopener noreferrer">
          chart
        </Link>
        <Divider type="vertical" />
        <Popconfirm
          title="Are you sure?"
          onConfirm={e => deleteQuery(record._id)}
          onCancel={() => {}}
          okText="Yes"
          cancelText="No"
        >
          <Button icon="delete" type="danger" />
        </Popconfirm>
      </span>
    );
  };

  const getDecoratedQueries = () => {
    // Create index of lookups
    // TODO this should come from API
    const connectionsById = connections.reduce((connMap, connection) => {
      connMap[connection._id] = connection;
      return connMap;
    }, {});

    return queries.map(query => {
      query.key = query._id;

      const connection = connectionsById[query.connectionId];
      query.connectionName = connection ? connection.name : '';

      return query;
    });
  };

  const renderTable = () => {
    let filteredQueries = getDecoratedQueries();

    if (selectedTags.length) {
      filteredQueries = filteredQueries.filter(q => {
        if (!q.tags || !q.tags.length) {
          return false;
        }
        const matchedTags = selectedTags.filter(
          selectedTag => q.tags.indexOf(selectedTag) > -1
        );
        return selectedTags.length === matchedTags.length;
      });
    }

    if (searchInput) {
      const terms = searchInput.split(' ');
      const termCount = terms.length;
      filteredQueries = filteredQueries.filter(q => {
        let matchedCount = 0;
        terms.forEach(term => {
          term = term.toLowerCase();
          if (
            (q.name && q.name.toLowerCase().search(term) !== -1) ||
            (q.queryText && q.queryText.toLowerCase().search(term) !== -1)
          ) {
            matchedCount++;
          }
        });
        return matchedCount === termCount;
      });
    }

    if (selectedConnection) {
      filteredQueries = filteredQueries.filter(
        q => q.connectionId === selectedConnection
      );
    }

    if (selectedCreatedBy) {
      filteredQueries = filteredQueries.filter(
        q => q.createdBy === selectedCreatedBy
      );
    }

    return (
      <Table
        locale={{ emptyText: 'No queries found' }}
        dataSource={filteredQueries}
        pagination={false}
        className="w-100"
      >
        <Column
          title="Name"
          key="name"
          render={nameRender}
          sorter={nameSorter}
        />
        <Column title="" key="preview" render={previewRender} />
        <Column
          title="Connection"
          key="connection"
          dataIndex="connectionName"
        />
        <Column title="Tags" key="tags" render={tagsRender} />
        <Column title="Created by" dataIndex="createdBy" key="createdBy" />
        <Column
          title="Modified"
          key="modifiedCalendar"
          defaultSortOrder="descend"
          sorter={modifiedSorter}
          render={modifiedRender}
        />
        <Column key="action" render={actionsRender} />
      </Table>
    );
  };

  // style={{ minHeight: '100vh' }}
  // className="flex w-100 flex-column h-100"
  // <Content className="ma4 h-100"></Content>
  return (
    <div
    // style={{ minHeight: '100vh' }}
    // className="flex w-100 flex-column h-100"
    >
      <Row gutter={16}>
        <Col className="pb3" span={24}>
          <Link to={'/queries/new'}>
            <Button type="primary">New Query</Button>
          </Link>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col className="pb3" span={6}>
          <Search
            className="w-100"
            placeholder="Search"
            value={searchInput}
            onChange={onSearchChange}
          />
        </Col>
        <Col className="gutter-row" span={6}>
          <Select
            className="w-100"
            placeholder="Filter by connection"
            value={selectedConnection}
            onChange={value => setSelectedConnection(value)}
          >
            <Option key="all" value="">
              All connections
            </Option>
            {connections.map(c => (
              <Option key={c._id}>{c.name}</Option>
            ))}
          </Select>
        </Col>
        <Col className="gutter-row" span={6}>
          <Select
            className="w-100"
            mode="multiple"
            placeholder="Filter by tag"
            value={selectedTags}
            onChange={value => setSelectedTags(value)}
          >
            {tags.map(tag => (
              <Option key={tag}>{tag}</Option>
            ))}
          </Select>
        </Col>
        <Col className="gutter-row" span={6}>
          <Select
            className="w-100"
            placeholder="Filter by created by"
            value={selectedCreatedBy}
            onChange={value => setSelectedCreatedBy(value)}
          >
            <Option key="all" value="">
              All authors
            </Option>
            {createdBys.map(c => (
              <Option key={c}>{c}</Option>
            ))}
          </Select>
        </Col>
      </Row>
      <div className="bg-white">{renderTable()}</div>
    </div>
  );
}

export default connect(
  ['queries', 'connections'],
  actions
)(QueriesView);
