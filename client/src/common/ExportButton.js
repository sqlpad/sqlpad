import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../stores/unistoreStore';
import Button from '../common/Button';

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
    <>
      {onSaveImageClick && <Button onClick={onSaveImageClick}>png</Button>}
      <Button>
        <a target="_blank" rel="noopener noreferrer" href={csvDownloadLink}>
          csv
        </a>
      </Button>
      <Button>
        <a target="_blank" rel="noopener noreferrer" href={xlsxDownloadLink}>
          xlsx
        </a>
      </Button>
    </>
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
