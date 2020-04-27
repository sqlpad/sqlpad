import React, { useEffect, useState } from 'react';
import { connect } from 'unistore/react';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import fetchJson from '../utilities/fetch-json';
import message from '../common/message';
import Modal from '../common/Modal';
import ServiceTokenForm from './ServiceTokenForm';
import ServiceTokenDetails from './ServiceTokenDetails';

function ServiceTokenList({ currentUser }) {
  const [serviceTokens, setServiceTokens] = useState([]);
  const [showServiceTokenForm, setShowServiceTokenForm] = useState(false);
  const [generatedServiceToken, setGenerateServiceToken] = useState(null);
  const [showGeneratedServiceToken, setShowGeneratedServiceToken] = useState(
    false
  );

  const loadServiceTokensFromServer = async () => {
    const json = await fetchJson('GET', '/api/service-tokens');
    if (json.error) {
      message.error(json.error);
    } else {
      setServiceTokens(json.data);
    }
  };

  useEffect(() => {
    loadServiceTokensFromServer();
  }, [generatedServiceToken]);

  const generateServiceToken = () => {
    setShowServiceTokenForm(true);
  };

  const deleteServiceToken = async serviceTokenId => {
    const json = await fetchJson(
      'DELETE',
      `/api/service-tokens/${serviceTokenId}`
    );
    if (json.error) {
      return message.error('Delete failed: ' + json.error);
    }
    loadServiceTokensFromServer();
  };

  const handleGenerateFormClose = () => {
    setShowServiceTokenForm(false);
    setShowGeneratedServiceToken(false);
  };

  const handleServiceTokenGenerated = serviceToken => {
    setGenerateServiceToken(serviceToken);
    setShowServiceTokenForm(false);
    setShowGeneratedServiceToken(true);
  };

  const handleShowGeneratedTokenClose = () => {
    setGenerateServiceToken(null);
    setShowGeneratedServiceToken(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          style={{ width: 135 }}
          variant="primary"
          onClick={generateServiceToken}
        >
          Generate
        </Button>
      </div>
      {serviceTokens.map(item => {
        const actions = [];

        actions.push(
          <DeleteConfirmButton
            key="delete"
            confirmMessage="Delete service token?"
            onConfirm={e => deleteServiceToken(item.id)}
            style={{ marginLeft: 8 }}
          >
            Delete
          </DeleteConfirmButton>
        );

        return (
          <ListItem key={item.id}>
            <div style={{ flexGrow: 1, padding: 8 }}>
              <b>Name:</b> {item.name}
              <br />
              <b>Role:</b> {item.role}
              <br />
              <b>Token:</b> {item.maskedToken}
              <br />
              <b>Expiry Date:</b>{' '}
              {item.expiryDate
                ? new Date(item.expiryDate).toLocaleString()
                : 'Indefinite'}
              <br />
            </div>
            {actions}
          </ListItem>
        );
      })}

      <Modal
        title="Generate Service Token"
        visible={showServiceTokenForm}
        width={'500px'}
        onClose={handleGenerateFormClose}
      >
        <ServiceTokenForm
          onServiceTokenGenerated={handleServiceTokenGenerated}
        />
      </Modal>

      <Modal
        title="Service Token generated"
        visible={showGeneratedServiceToken}
        width={'500px'}
        onClose={handleShowGeneratedTokenClose}
      >
        <ServiceTokenDetails serviceToken={generatedServiceToken} />
      </Modal>
    </>
  );
}

export default connect(['currentUser'])(ServiceTokenList);
