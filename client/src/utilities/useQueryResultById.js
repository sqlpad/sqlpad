import { useEffect, useState } from 'react';
import runQueryViaBatch from './runQueryViaBatch';
import fetchJson from './fetch-json.js';

function useQueryResultById(queryId) {
  const [isRunning, setIsRunning] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    const runQuery = async (queryId) => {
      setIsRunning(true);

      const queryJson = await fetchJson('GET', '/api/queries/' + queryId);
      if (queryJson.error) {
        setIsRunning(false);
        setQueryError(queryJson.error);
        return;
      }
      const query = queryJson.data;

      const resultJson = await runQueryViaBatch({
        queryId,
        name: query.name,
        chart: query.chart,
        batchText: query.queryText,
        connectionId: query.connectionId,
      });
      setIsRunning(false);
      setQueryError(resultJson.error);
      setQueryResult({ ...query, ...resultJson.data });
    };

    runQuery(queryId);
  }, [queryId]);

  return [queryError, queryResult, isRunning];
}

export default useQueryResultById;
