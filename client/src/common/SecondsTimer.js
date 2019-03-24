import React, { useState, useEffect } from 'react';

function SecondsTimer({ startTime }) {
  const [runSeconds, setRunSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setRunSeconds(((now - startTime) / 1000).toFixed(0));
    }, 33);
    return () => clearInterval(intervalId);
  }, []);

  return <span>{runSeconds}</span>;
}

export default SecondsTimer;
