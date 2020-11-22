import React from 'react';
import FormExplain from '../common/FormExplain';
import Spacer from '../common/Spacer';
import { useSessionBatch } from '../stores/editor-store';
import AlertIcon from 'mdi-react/AlertCircleOutlineIcon';

function ChartStatementDisclaimer() {
  const batch = useSessionBatch();

  if (batch && batch.statements.length > 1) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertIcon
            size={20}
            style={{ flexShrink: 0, flexGrow: 0, marginRight: 8 }}
          />
          <div style={{ flexGrow: 1 }}>
            <FormExplain>
              Visualization will use last statement's results.
            </FormExplain>
          </div>
        </div>

        <Spacer size={2} />
      </>
    );
  }

  return null;
}

export default React.memo(ChartStatementDisclaimer);
