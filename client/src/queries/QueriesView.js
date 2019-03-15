import { Col, Row } from 'antd';
import Button from 'antd/lib/button';
import Divider from 'antd/lib/divider';
import Icon from 'antd/lib/icon';
import Input from 'antd/lib/input';
import Layout from 'antd/lib/layout';
import message from 'antd/lib/message';
import Popconfirm from 'antd/lib/popconfirm';
import Popover from 'antd/lib/popover';
import Select from 'antd/lib/select';
import Table from 'antd/lib/table';
import Tag from 'antd/lib/tag';
import uniq from 'lodash.uniq';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import AppNav from '../AppNav';
import Header from '../common/Header';
import SqlEditor from '../common/SqlEditor';
import AppContext from '../containers/AppContext';
import fetchJson from '../utilities/fetch-json.js';

const { Content } = Layout;

const { Option } = Select;
const { Column } = Table;
const { Search } = Input;

class QueriesView extends React.Component {
  state = {
    queries: [],
    connections: [],
    createdBys: [],
    tags: [],
    tagFilterDropdownVisible: false,
    searchInput: null,
    selectedTags: [],
    selectedConnection: '',
    selectedCreatedBy: this.props.currentUser
      ? this.props.currentUser.email
      : ''
  };

  handleQueryDelete = queryId => {
    let { queries } = this.state;
    queries = queries.filter(q => {
      return q._id !== queryId;
    });
    this.setState({
      queries
    });
    fetchJson('DELETE', '/api/queries/' + queryId).then(json => {
      if (json.error) message.error(json.error);
    });
  };

  loadConfigValuesFromServer = () => {
    fetchJson('GET', '/api/queries').then(json => {
      const queries = json.queries || [];
      const createdBys = uniq(queries.map(q => q.createdBy));
      const tags = uniq(
        queries
          .map(q => q.tags)
          .reduce((a, b) => a.concat(b), [])
          .filter(tag => tag)
      );
      let selectedCreatedBy = this.state.selectedCreatedBy;
      const email = this.props.currentUser && this.props.currentUser.email;
      if (createdBys.indexOf(email) === -1) {
        selectedCreatedBy = '';
      }
      this.setState({
        queries: json.queries,
        createdBys: createdBys,
        selectedCreatedBy: selectedCreatedBy,
        tags: tags
      });
    });
    fetchJson('GET', '/api/connections').then(json => {
      this.setState({ connections: json.connections });
    });
  };

  onSearchChange = e => {
    this.setState({
      searchInput: e.target.value
    });
  };

  componentDidMount() {
    document.title = 'SQLPad - Queries';
    this.loadConfigValuesFromServer();
  }

  nameRender = (text, record) => {
    return <Link to={'/queries/' + record._id}>{record.name}</Link>;
  };

  previewRender = (text, record) => {
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

  nameSorter = (a, b) => a.name.localeCompare(b.name);

  modifiedSorter = (a, b) => {
    return moment(a.modifiedDate).toDate() - moment(b.modifiedDate).toDate();
  };

  modifiedRender = (text, record) => moment(record.modifiedDate).calendar();

  tagsRender = (text, record) => {
    if (record.tags && record.tags.length) {
      return record.tags.map(tag => <Tag key={tag}>{tag}</Tag>);
    }
  };

  actionsRender = (text, record) => {
    return (
      <AppContext.Consumer>
        {appContext => {
          const { config } = appContext;
          const tableUrl = `${config.baseUrl}/query-table/${record._id}`;
          const chartUrl = `${config.baseUrl}/query-chart/${record._id}`;
          return (
            <span>
              <a href={tableUrl} target="_blank" rel="noopener noreferrer">
                table
              </a>
              <Divider type="vertical" />
              <a href={chartUrl} target="_blank" rel="noopener noreferrer">
                chart
              </a>
              <Divider type="vertical" />
              <Popconfirm
                title="Are you sure?"
                onConfirm={e => this.handleQueryDelete(record._id)}
                onCancel={() => {}}
                okText="Yes"
                cancelText="No"
              >
                <Button icon="delete" type="danger" />
              </Popconfirm>
            </span>
          );
        }}
      </AppContext.Consumer>
    );
  };

  getDecoratedQueries() {
    const { queries, connections } = this.state;

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
  }

  renderTable() {
    const {
      searchInput,
      selectedConnection,
      selectedCreatedBy,
      selectedTags
    } = this.state;

    let filteredQueries = this.getDecoratedQueries();

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
          render={this.nameRender}
          sorter={this.nameSorter}
        />
        <Column title="" key="preview" render={this.previewRender} />
        <Column
          title="Connection"
          key="connection"
          dataIndex="connectionName"
        />
        <Column title="Tags" key="tags" render={this.tagsRender} />
        <Column title="Created by" dataIndex="createdBy" key="createdBy" />
        <Column
          title="Modified"
          key="modifiedCalendar"
          defaultSortOrder="descend"
          sorter={this.modifiedSorter}
          render={this.modifiedRender}
        />
        <Column key="action" render={this.actionsRender} />
      </Table>
    );
  }

  renderFilters() {
    const {
      connections,
      createdBys,
      searchInput,
      selectedConnection,
      selectedCreatedBy,
      selectedTags,
      tags
    } = this.state;
    return (
      <Row gutter={16}>
        <Col className="pb3" span={6}>
          <Search
            className="w-100"
            placeholder="Search"
            value={searchInput}
            onChange={this.onSearchChange}
          />
        </Col>
        <Col className="gutter-row" span={6}>
          <Select
            className="w-100"
            placeholder="Filter by connection"
            value={selectedConnection}
            onChange={selectedConnection =>
              this.setState({ selectedConnection })
            }
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
            onChange={selectedTags => this.setState({ selectedTags })}
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
            onChange={selectedCreatedBy => this.setState({ selectedCreatedBy })}
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
    );
  }

  render() {
    return (
      <AppNav>
        <Layout
          style={{ minHeight: '100vh' }}
          className="flex w-100 flex-column h-100"
        >
          <Header title="Queries">
            <Link to={'/queries/new'}>
              <Button type="primary">New Query</Button>
            </Link>
          </Header>
          <Content className="ma4">
            {this.renderFilters()}
            <div className="bg-white">{this.renderTable()}</div>
          </Content>
        </Layout>
      </AppNav>
    );
  }
}

export default QueriesView;
