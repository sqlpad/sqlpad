import { useEffect } from 'react';
import { connect } from 'unistore/react';

function mapStateToProps(state, props) {
  const queryName = state.query && state.query.name;
  return {
    title: props.queryId === 'new' ? 'New query' : queryName,
  };
}

/**
 * This component isolates the work of updating the document title on query name changes.
 * This prevents the main QueryEditor component from needing to render on name change.
 * Once unistore has a hooks interface this can become a custom hook
 * @param {object} props
 */
function DocumentTitle({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}

export default connect(mapStateToProps)(DocumentTitle);
