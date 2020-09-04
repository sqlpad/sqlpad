import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Measure from 'react-measure';
import { diff as DiffEditor } from 'react-ace';
require(`ace-builds/src-noconflict/mode-sql`);
require(`ace-builds/src-noconflict/theme-sqlserver`);

export interface Props {
  value?: string[];
}

function SqlDiff({ value }: Props) {
  const [dimensions, setDimensions] = useState({ width: -1, height: -1 });
  const { width, height } = dimensions;

  // DiffEditor isn't responding to size changes or initial measure
  // As a workaround, setting the key based on size will ensure React re-renders it
  const key = `${width}${height}`;

  return (
    <Measure
      bounds
      onResize={(contentRect) => {
        if (contentRect && contentRect.bounds) {
          setDimensions(contentRect.bounds);
        }
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className="h-100 w-100">
          <DiffEditor
            key={key}
            focus={false}
            editorProps={{ $blockScrolling: Infinity }}
            height={`${height}px`}
            mode="sql"
            name="query-diff-ace-editor"
            theme="sqlserver"
            readOnly={true}
            value={value}
            width={`${width}px`}
          />
        </div>
      )}
    </Measure>
  );
}

SqlDiff.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
};

SqlDiff.defaultProps = {
  value: ['', ''],
};

export default SqlDiff;
