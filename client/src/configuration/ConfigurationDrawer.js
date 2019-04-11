import Drawer from 'antd/lib/drawer';
import React, { useState, useEffect } from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import ConfigurationForm from './ConfigurationForm';

const formItemLayout = {
  labelCol: {
    sm: { span: 12 }
  },
  wrapperCol: {
    sm: { span: 10 }
  }
};

const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 10,
      offset: 12
    }
  }
};

function ConfigurationDrawer({ onClose, visible }) {
  return (
    <Drawer
      title={'Configuration'}
      visible={visible}
      width={600}
      destroyOnClose={false}
      onClose={onClose}
      placement={'left'}
    >
      <ConfigurationForm onClose={onClose} />
    </Drawer>
  );
}

export default connect(
  [],
  actions
)(React.memo(ConfigurationDrawer));
