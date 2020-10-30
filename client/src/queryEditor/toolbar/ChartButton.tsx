import ChartIcon from 'mdi-react/ChartBarIcon';
import React from 'react';
import Button from '../../common/Button';
import IconButton from '../../common/IconButton';
import Modal from '../../common/Modal';
import Spacer from '../../common/Spacer';
import { toggleVisProperties } from '../../stores/editor-actions';
import { useSessionShowVisProperties } from '../../stores/editor-store';
import ChartInputsContainer from '../ChartInputsContainer';
import ChartTypeSelect from '../ChartTypeSelect';

function ChartButton() {
  const visible = useSessionShowVisProperties();

  return (
    <>
      <IconButton
        tooltip="Configure visualization"
        onClick={() => toggleVisProperties()}
      >
        <ChartIcon />
      </IconButton>
      <Modal
        width={500}
        title="Configure visualization"
        visible={visible}
        onClose={() => toggleVisProperties()}
      >
        <ChartTypeSelect />
        <Spacer size={2} />
        <ChartInputsContainer />
        <Spacer size={2} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => toggleVisProperties()}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default React.memo(ChartButton);
