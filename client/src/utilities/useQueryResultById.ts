import { useEffect, useState } from 'react';
import runQueryViaBatch from './runQueryViaBatch';
import { api } from './api';

function useQueryResultById(queryId: string) {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string>('');

  useEffect(() => {
    const runQuery = async (queryId: string) => {
      setIsRunning(true);

      const queryJson = await api.getQuery(queryId);
      if (queryJson.error) {
        setIsRunning(false);
        setQueryError(queryJson.error);
        return;
      }

      if (!queryJson.data) {
        setIsRunning(false);
        setQueryError('Query not found');
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
