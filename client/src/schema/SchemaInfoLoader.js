import { useEffect } from 'react';
import { connect } from 'unistore/react';
import useSchemaState from '../stores/use-schema-state';

function mapStateToProps(state, props) {
  return {
    connectionId: state.selectedConnectionId,
  };
}

/**
 * Instead of loading schema on selection,
 * this is acts as a listener-as-a-component for schema changes.
 * This is not in the schema sidebar,
 * because sidebar could be hidden and this is an application-level need
 * @param {*} props
 */
function SchemaInfoLoader({ connectionId }) {
  const { loadSchemaInfo } = useSchemaState();

  useEffect(() => {
    if (connectionId) {
      loadSchemaInfo(connectionId);
    }
  }, [connectionId, loadSchemaInfo]);

  return null;
}

export default connect(mapStateToProps)(SchemaInfoLoader);
