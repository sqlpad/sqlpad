import { useCallback } from 'react';
import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';
import updateCompletions from '../utilities/updateCompletions.js';
import { useKeyState } from './key-state';

function useSchemaState() {
  const [showSchema, setShowSchema] = useKeyState('showSchema', true);
  const [schema, setSchema] = useKeyState('schema', {});

  const toggleSchema = useCallback(() => {
    setShowSchema((showSchema) => !showSchema);
  }, [setShowSchema]);

  const loadSchemaInfo = useCallback(
    async (connectionId, reload) => {
      if (!schema[connectionId] || reload) {
        setSchema({
          ...schema,
          [connectionId]: {
            loading: true,
            expanded: {},
          },
        });

        const qs = reload ? '?reload=true' : '';
        const json = await fetchJson(
          'GET',
          `/api/schema-info/${connectionId}${qs}`
        );
        const { error, data } = json;
        if (error) {
          setSchema({
            ...schema,
            [connectionId]: {
              loading: false,
              error,
            },
          });
          // If sidebar is not shown, send error notification
          // It is otherwise shown in sidebar where schema would be
          if (!showSchema) {
            message.error(error);
          }
          return;
        }
        updateCompletions(data);

        // Pre-expand schemas
        const expanded = {};
        if (data) {
          Object.keys(data).forEach((schemaName) => {
            expanded[schemaName] = true;
          });
        }

        setSchema({
          ...schema,
          [connectionId]: {
            loading: false,
            schemaInfo: data,
            error: null,
            expanded,
          },
        });
      }
    },
    [schema, showSchema, setSchema]
  );

  const toggleSchemaItem = useCallback(
    (connectionId, item) => {
      const connectionSchema = schema[connectionId];
      const open = !connectionSchema.expanded[item.id];
      setSchema({
        ...schema,
        [connectionId]: {
          ...connectionSchema,
          expanded: { ...connectionSchema.expanded, [item.id]: open },
        },
      });
    },
    [schema, setSchema]
  );

  return {
    showSchema,
    schema,
    toggleSchema,
    loadSchemaInfo,
    toggleSchemaItem,
  };
}

export default useSchemaState;
