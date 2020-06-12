import message from '../common/message';
import fetchJson from '../utilities/fetch-json.js';
import updateCompletions from '../utilities/updateCompletions.js';

import React, { useState, useCallback } from 'react';

const SchemaContext = React.createContext();

function SchemaProvider({ children }) {
  const [showSchema, setShowSchema] = useState(true);
  const [schema, setSchema] = useState({});

  const toggleSchema = useCallback(() => {
    setShowSchema((showSchema) => !showSchema);
  }, []);

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
    [schema, showSchema]
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
    [schema]
  );

  const value = {
    showSchema,
    schema,
    toggleSchema,
    loadSchemaInfo,
    toggleSchemaItem,
  };

  return (
    <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>
  );
}

function useSchemaState() {
  const context = React.useContext(SchemaContext);
  if (context === undefined) {
    throw new Error('useSchemaState must be used within a CountProvider');
  }
  return context;
}

export { SchemaProvider, useSchemaState };
