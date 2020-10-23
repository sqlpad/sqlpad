import { useEffect } from 'react';
import { loadSchema } from '../stores/editor-actions';
import { useSessionConnectionId } from '../stores/editor-store';

/**
 * Instead of loading schema on selection,
 * this is acts as a listener-as-a-component for schema changes.
 * This is not in the schema sidebar,
 * because sidebar could be hidden and this is an application-level need
 */
function SchemaInfoLoader() {
  const selectedConnectionId = useSessionConnectionId();

  useEffect(() => {
    if (selectedConnectionId) {
      loadSchema(selectedConnectionId);
    }
  }, [selectedConnectionId]);

  return null;
}

export default SchemaInfoLoader;
