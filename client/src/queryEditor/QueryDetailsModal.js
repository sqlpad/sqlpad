import Icon from 'antd/lib/icon';
import Modal from 'antd/lib/modal';
import Tooltip from 'antd/lib/tooltip';
import PropTypes from 'prop-types';
import React from 'react';
import EditableTagGroup from '../common/EditableTagGroup';

class QueryDetailsModal extends React.Component {
  onQueryNameChange = e => {
    this.props.onQueryNameChange(e.target.value);
  };

  renderNavLink = (href, text) => {
    const { query } = this.props;
    const saved = !!query._id;
    if (saved) {
      return (
        <li role="presentation">
          <a href={href} target="_blank" rel="noopener noreferrer">
            {text} <Icon type="export" />
          </a>
        </li>
      );
    } else {
      return (
        <Tooltip title="Save query to enable table/chart view links">
          <li role="presentation" className="disabled">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.preventDefault()}
            >
              {text} <Icon type="export" />
            </a>
          </li>
        </Tooltip>
      );
    }
  };

  render() {
    const {
      config,
      onHide,
      onQueryTagsChange,
      query,
      showModal,
      tagOptions
    } = this.props;

    const tableUrl = `${config.baseUrl}/query-table/${query._id}`;
    const chartUrl = `${config.baseUrl}/query-chart/${query._id}`;

    return (
      <Modal
        width={'600px'}
        visible={showModal}
        cancelText={null}
        onCancel={onHide}
        footer={null}
      >
        <label>Query Tags</label>
        <EditableTagGroup
          tags={query.tags}
          onChange={onQueryTagsChange}
          tagOptions={tagOptions}
        />
        <hr />
        <p>
          <label>Shortcuts</label>
        </p>
        <ul style={{ paddingLeft: 0 }}>
          <li style={{ listStyleType: 'none', marginBottom: 8 }}>
            <code>ctrl+s</code> / <code>command+s</code> : Save
          </li>
          <li style={{ listStyleType: 'none', marginBottom: 8 }}>
            <code>ctrl+return</code> / <code>command+return</code> : Run
          </li>
          <li style={{ listStyleType: 'none', marginBottom: 8 }}>
            <code>shift+return</code> : Format
          </li>
        </ul>
        <hr />
        <p>
          <strong>Tip</strong>
        </p>
        <p>Run only a portion of a query by highlighting it first.</p>
        <hr />
        <ul className="nav nav-pills nav-justified">
          {this.renderNavLink(tableUrl, 'Link to Table')}
          {this.renderNavLink(chartUrl, 'Link to Chart')}
        </ul>
      </Modal>
    );
  }
}

QueryDetailsModal.propTypes = {
  config: PropTypes.object.isRequired,
  onHide: PropTypes.func.isRequired,
  onQueryTagsChange: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired,
  showModal: PropTypes.bool.isRequired,
  tagOptions: PropTypes.array
};

QueryDetailsModal.defaultProps = {
  tagOptions: []
};

export default QueryDetailsModal;
