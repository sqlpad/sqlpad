import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import AppContext from '../containers/AppContext';

function ExportButton({ cacheKey, onSaveImageClick }) {
  const appContext = useContext(AppContext);
  const { config } = appContext;

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
            <Menu.Item onClick={this.onSaveImageClick}>png</Menu.Item>
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

export default ExportButton;
