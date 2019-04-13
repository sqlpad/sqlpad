/**
 * Get array of queries decorated with `connectionName` property
 * @param {array} queries
 * @param {array} connections
 */
export default function getDecoratedQueries(queries, connections) {
  // Create index of lookups
  // TODO this should come from API
  const connectionsById = connections.reduce((connMap, connection) => {
    connMap[connection._id] = connection;
    return connMap;
  }, {});

  return queries.map(query => {
    query.key = query._id;

    const connection = connectionsById[query.connectionId];
    query.connectionName = connection ? connection.name : '';

    return query;
  });
}
