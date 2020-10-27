import { useEffect, useState } from 'react';
import { loadQuery, runQuery } from '../stores/editor-actions';

function useQueryResultById(queryId: string): [boolean] {
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    const main = async (queryId: string) => {
      setIsRunning(true);
      await loadQuery(queryId);
      await runQuery();
      setIsRunning(false);
    };

    main(queryId);
  }, [queryId]);

  return [isRunning];
}

export default useQueryResultById;
