import { useEffect } from 'react';
import { connect } from 'unistore/react';
import useSchemaState from '../stores/use-schema-state';

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
  const { loadSchemaInfo } = useSchemaState();

  useEffect(() => {
    if (connectionId) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      loadSchemaInfo(connectionId);
    }
  }, [connectionId, loadSchemaInfo]);

  return null;
}

export default connect(mapStateToProps)(SchemaInfoLoader);
