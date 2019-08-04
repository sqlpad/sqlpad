import React from 'react';
import PropTypes from 'prop-types';

function QueryResultError({ queryError }) {
  return (
    <div
      style={{ fontSize: '1.5rem', padding: 24, textAlign: 'center' }}
      className={`h-100 bg-error flex-center`}
    >
      {queryError}
    </div>
  );
}

QueryResultError.propTypes = {
  queryError: PropTypes.string
};

export default QueryResultError;
