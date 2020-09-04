import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Button from '../common/Button';
import DeleteConfirmButton from '../common/DeleteConfirmButton';
import ListItem from '../common/ListItem';
import message from '../common/message';
import Modal from '../common/Modal';
import { api } from '../utilities/fetch-json';
import ServiceTokenDetails from './ServiceTokenDetails';
import ServiceTokenForm from './ServiceTokenForm';

function ServiceTokenList() {
  const [showServiceTokenForm, setShowServiceTokenForm] = useState(false);
  const [generatedServiceToken, setGenerateServiceToken] = useState(null);
  const [showGeneratedServiceToken, setShowGeneratedServiceToken] = useState(
    false
  );

  const { data: serviceTokensData, error, mutate } = useSWR(
    '/api/service-tokens'
  );
  const serviceTokens = serviceTokensData || [];

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const generateServiceToken = () => {
    setShowServiceTokenForm(true);
  };

  const deleteServiceToken = async (serviceTokenId: any) => {
    const json = await api.delete(`/api/service-tokens/${serviceTokenId}`);
    if (json.error) {
      return message.error('Delete failed: ' + json.error);
    }
    mutate(serviceTokens.filter((item: any) => item.id !== serviceTokenId));
  };

  const handleGenerateFormClose = () => {
    setShowServiceTokenForm(false);
    setShowGeneratedServiceToken(false);
  };

  const handleServiceTokenGenerated = (serviceToken: any) => {
    mutate();
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
      {serviceTokens.map((item: any) => {
        const actions = [];

        actions.push(
          <DeleteConfirmButton
            key="delete"
            confirmMessage="Delete service token?"
            // @ts-expect-error
            onConfirm={(e: any) => deleteServiceToken(item.id)}
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
        // @ts-expect-error
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
        // @ts-expect-error
        onClose={handleShowGeneratedTokenClose}
      >
        <ServiceTokenDetails serviceToken={generatedServiceToken} />
      </Modal>
    </>
  );
}

export default ServiceTokenList;
