import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';

function ExportButton({ config, cacheKey, onSaveImageClick }) {
  if (!config) {
    return null;
  }

  const { baseUrl, allowCsvDownload } = config;

  if (!cacheKey || !allowCsvDownload) {
    return null;
  }

  const csvDownloadLink = `${baseUrl}/download-results/${cacheKey}.csv`;
  const xlsxDownloadLink = `${baseUrl}/download-results/${cacheKey}.xlsx`;

  return (
    <Dropdown
      overlay={
        <Menu>
          {onSaveImageClick && (
            <Menu.Item onClick={onSaveImageClick}>png</Menu.Item>
          )}
          <Menu.Item>
            <a target="_blank" rel="noopener noreferrer" href={csvDownloadLink}>
              csv
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={xlsxDownloadLink}
            >
              xlsx
            </a>
          </Menu.Item>
        </Menu>
      }
    >
      <Button>
        Export <Icon type="down" />
      </Button>
    </Dropdown>
  );
}

ExportButton.propTypes = {
  cacheKey: PropTypes.string,
  onSaveImageClick: PropTypes.func
};

export default connect(
  ['config'],
  actions
)(ExportButton);
