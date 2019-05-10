import OpenInNewIcon from 'mdi-react/OpenInNewIcon';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'unistore/react';
import { actions } from '../../stores/unistoreStore';
import Modal from '../../common/Modal';
import Button from '../../common/Button';

function mapStateToProps(state) {
  return {
    queryId: state.query && state.query._id
  };
}

const ConnectedQueryDetailsModal = connect(
  mapStateToProps,
  actions
)(React.memo(QueryDetailsModal));

function QueryDetailsModal({ queryId, visible, onClose }) {
  const renderNavLink = (href, text) => {
    const saved = !!queryId;
    if (saved) {
      return (
        <Link
          style={{ display: 'inline-flex', alignItems: 'center' }}
          to={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text} <OpenInNewIcon size={18} />
        </Link>
      );
    }
  };

  const tableUrl = `/query-table/${queryId}`;
  const chartUrl = `/query-chart/${queryId}`;

  return (
    <Modal width={'600px'} visible={visible} onClose={onClose}>
      <label>Query Tags</label>
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          marginBottom: 16
        }}
      >
        {renderNavLink(tableUrl, 'Link to Table')}
        {renderNavLink(chartUrl, 'Link to Chart')}
      </div>
      <Button type="primary" onClick={onClose}>
        OK
      </Button>
    </Modal>
  );
}

export default ConnectedQueryDetailsModal;
