import { useEffect } from 'react';
import { loadSchemaInfo } from '../stores/editor-actions';
import { useSelectedConnectionId } from '../stores/editor-store';

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
