import { useEffect } from 'react';
import { useSelectedConnectionId } from '../stores/queries-actions';
import { loadSchemaInfo } from '../stores/queries-actions';

/**
 * Instead of loading schema on selection,
 * this is acts as a listener-as-a-component for schema changes.
 * This is not in the schema sidebar,
 * because sidebar could be hidden and this is an application-level need
 */
function SchemaInfoLoader() {
  const selectedConnectionId = useSelectedConnectionId();

  useEffect(() => {
    if (selectedConnectionId) {
      loadSchemaInfo(selectedConnectionId);
    }
  }, [selectedConnectionId]);

  return null;
}

export default SchemaInfoLoader;
