import { useEffect } from 'react';
import { connect } from 'unistore/react';
import { loadSchemaInfo } from '../stores/schema-store';

function mapStateToProps(state: any, props: any) {
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
function SchemaInfoLoader({ connectionId }: any) {
  useEffect(() => {
    if (connectionId) {
      loadSchemaInfo(connectionId);
    }
  }, [connectionId]);

  return null;
}

export default connect(mapStateToProps)(SchemaInfoLoader);
