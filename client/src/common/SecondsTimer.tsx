import React, { useState, useEffect } from 'react';

export interface Props {
  startTime: Date;
}

function SecondsTimer({ startTime }: Props) {
  const [runSeconds, setRunSeconds] = useState('0');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setRunSeconds(((now.valueOf() - startTime.valueOf()) / 1000).toFixed(3));
    }, 33);
    return () => clearInterval(intervalId);
  }, [startTime]);

  return <span>{runSeconds}</span>;
}

export default SecondsTimer;
