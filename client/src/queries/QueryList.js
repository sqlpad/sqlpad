import EditIcon from 'mdi-react/PencilIcon';
import TableIcon from 'mdi-react/TableIcon';
import ChartIcon from 'mdi-react/FinanceIcon';
import List from 'antd/lib/list';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Tooltip from 'antd/lib/tooltip';
import Typography from 'antd/lib/typography';
import Tag from 'antd/lib/tag';
import Divider from 'antd/lib/divider';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import Popconfirm from 'antd/lib/popconfirm';
import getAvailableSearchTags from './getAvailableSearchTags';
import getDecoratedQueries from './getDecoratedQueries';
import IconButtonLink from '../common/IconButtonLink';
import SqlEditor from '../common/SqlEditor';
import Button from '../common/Button';
import Select from '../common/Select';
import styles from './QueryList.module.css';

const { Title } = Typography;

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
  }, [loadQueries]);

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
        className={styles.ListItem}
        onMouseEnter={() => setPreview(query)}
        onMouseLeave={() => setPreview('')}
        actions={[
          <Tooltip key="edit" title="Edit query">
            <IconButtonLink
              to={queryUrl}
              onClick={() => {
                onSelect(query);
              }}
            >
              <EditIcon />
            </IconButtonLink>
          </Tooltip>,
          <Tooltip key="table" title="Open results in new window">
            <IconButtonLink
              to={tableUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <TableIcon />
            </IconButtonLink>
          </Tooltip>,
          <Tooltip key="chart" title="Open chart in new window">
            <IconButtonLink
              to={chartUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ChartIcon />
            </IconButtonLink>
          </Tooltip>,
          <Popconfirm
            key="del"
            title="Are you sure?"
            onConfirm={e => deleteQuery(query._id)}
            onCancel={() => {}}
            okText="Yes"
            cancelText="No"
          >
            <Button type="danger">Delete</Button>
          </Popconfirm>
        ]}
      >
        <List.Item.Meta title={query.name} description={query.connectionName} />
      </List.Item>
    );
  };

  // TODO FIXME XXX searches select is meant to be multi value + open text string!
  // Figure out what to do about this later after antd removal
  return (
    <>
      <Row>
        <Col style={{ paddingBottom: 8 }} span={24}>
          <Select
            autoFocus
            className="w-100"
            value={searches && searches[0]}
            onChange={event => setSearches([event.target.value])}
          >
            {availableSearches.map(search => (
              <option key={search}>{search}</option>
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
          style={{
            position: 'fixed',
            left: 640,
            top: 40,
            right: 40,
            bottom: 40,
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 8px 2px rgba( 0, 0, 0, .2 )',
            padding: 16
          }}
        >
          <Title level={4}>
            <Typography.Text>{preview.name}</Typography.Text>
          </Title>
          <Typography.Text>Connection {preview.connectionName}</Typography.Text>
          <Typography.Text>By {preview.createdBy}</Typography.Text>
          <div>
            {preview.tags &&
              preview.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          </div>
          {/* needs to be wrapped in div because of flex height weirdness */}
          <div>
            <Divider />
          </div>
          {/* 
            This style necessary to get proper sizing on SqlEditor.
            It has height 100%, which looks to height of nearest containing BLOCK,
            which apparently looks past this flex container. This causes weirdness
          */}
          <div
            style={{
              flexGrow: 1,
              display: 'flex'
            }}
          >
            <SqlEditor readOnly value={preview.queryText} />
          </div>
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
