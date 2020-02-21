import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import fetchHtml from '../utilities/fetchHtml';

function mapStateToProps(state) {
  return {
    config: state.config
  };
}

const ConnectedCustomAppHeader = connect(mapStateToProps)(
  React.memo(CustomAppHeader)
);

function CustomAppHeader({ config }) {
  const [headerHtml, setHeaderHtml] = useState({ __html: '' });

  useEffect(() => {
    if (config.customAppTemplateConfigured) {
      let subscribed = true;
      fetchHtml('/custom-app-header').then(result => {
        if (subscribed) {
          setHeaderHtml({ __html: result });
        }
      });
      return () => {
        subscribed = false;
      };
    }
  }, [config]);

  if (headerHtml && headerHtml.__html) {
    return <div dangerouslySetInnerHTML={headerHtml} />;
  }
  return null;
}

export default ConnectedCustomAppHeader;
