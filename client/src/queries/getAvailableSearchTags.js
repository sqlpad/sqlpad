import uniq from 'lodash/uniq';

export default function getAvailableSearchTags(queries, connections) {
  const createdBys = uniq(queries.map(q => `createdBy=${q.createdBy}`));
  const tags = uniq(
    queries
      .map(q => q.tags)
      .reduce((a, b) => a.concat(b), [])
      .filter(tag => Boolean(tag))
      .map(tag => `tag=${tag}`)
  );

  return createdBys
    .concat(tags)
    .concat(connections.map(c => `connection=${c.name}`))
    .sort();
}
