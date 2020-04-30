import { useEffect } from 'react';
import { connect } from 'unistore/react';
import { loadSchemaInfo } from '../stores/schema';

function mapStateToProps(state, props) {
  return {
    connectionId: state.selectedConnectionId,
  };
}

function mapActions(store) {
  return {
    loadSchemaInfo: loadSchemaInfo(store),
  };
}

/**
 * Instead of loading schema on selection,
 * this is acts as a listener-as-a-component for schema changes.
 * This is not in the schema sidebar,
 * because sidebar could be hidden and this is an application-level need
 * @param {*} props
 */
function SchemaInfoLoader({ connectionId, loadSchemaInfo }) {
  useEffect(() => {
    if (connectionId) {
      loadSchemaInfo(connectionId);
    }
  }, [connectionId, loadSchemaInfo]);

  return null;
}

export default connect(mapStateToProps, mapActions)(SchemaInfoLoader);
