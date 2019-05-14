import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import { actions } from '../stores/unistoreStore';
import ButtonLink from './ButtonLink';

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
      <ButtonLink
        to={csvDownloadLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        csv
      </ButtonLink>
      <ButtonLink
        to={xlsxDownloadLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        xlsx
      </ButtonLink>
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
