import uniq from 'lodash/uniq';

export default function getAvailableSearchTags(queries, connections) {
  const createdBys = uniq(queries.map(q => q.createdBy)).map(createdBy => {
    return {
      id: `createdBy=${createdBy}`,
      name: `createdBy=${createdBy}`,
      createdBy
    };
  });

  const tags = uniq(
    queries
      .map(q => q.tags)
      .reduce((a, b) => a.concat(b), [])
      .filter(tag => Boolean(tag))
  ).map(tag => {
    return {
      id: `tag=${tag}`,
      name: `tag=${tag}`,
      tag
    };
  });

  const connectionOptions = connections.map(connection => {
    return {
      id: `connection=${connection._id}`,
      name: `connections=${connection.name}`,
      connectionId: connection._id
    };
  });

  return createdBys
    .concat(tags)
    .concat(connectionOptions)
    .sort();
}
