import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Button from '../common/Button';
import ErrorBlock from '../common/ErrorBlock';
import HSpacer from '../common/HSpacer';
import Input from '../common/Input';
import Modal from '../common/Modal';
import MultiSelect, { MultiSelectItem } from '../common/MultiSelect';
import Spacer from '../common/Spacer';
import { saveQuery, toggleShowSave } from '../stores/editor-actions';
import {
  EditorSession,
  useSessionACL,
  useSessionIsSaving,
  useSessionQueryName,
  useSessionSaveError,
  useSessionShowValidation,
  useSessionTags,
  useShowSave,
} from '../stores/editor-store';
import { ACLRecord } from '../types';
import { api } from '../utilities/api';
import ACLInput from './ACLInput';

// TODO: Add option between updating existing query, or saving new query (maybe)
// TODO: Enhance share options

// Instead of modelling the data as it is in the editor session
// a separate view model is used to track state
// Session data converts to it, and on save it gets transformed back to expected format
interface ViewModel {
  name: string;
  tags: string[];
  acl: Partial<ACLRecord>[];
}

function QuerySaveModal() {
  const showSave = useShowSave();
  const originalAcl = useSessionACL();
  const originalTags = useSessionTags();
  const originalName = useSessionQueryName();
  const showValidation = useSessionShowValidation();
  const isSaving = useSessionIsSaving();
  const saveError = useSessionSaveError();
  const initialRef = useRef(null);

  const [viewModel, setViewModel] = useState<ViewModel>({
    name: originalName,
    tags: originalTags || [],
    acl: originalAcl || [],
  });

  function resetViewModel() {
    setViewModel({
      name: originalName,
      tags: originalTags || [],
      acl: originalAcl || [],
    });
  }

  useEffect(() => {
    setViewModel((vm) => ({ ...vm, name: originalName }));
  }, [originalName]);

  useEffect(() => {
    setViewModel((vm) => ({
      ...vm,
      tags: originalTags || [],
    }));
  }, [originalTags]);

  useEffect(() => {
    setViewModel((vm) => ({
      ...vm,
      acl: originalAcl || [],
    }));
  }, [originalAcl]);

  const error = showValidation && !viewModel.name.length;

  const { data: tagsData } = api.useTags(showSave);
  const options = (tagsData || []).map((tag) => ({
    name: tag,
    id: tag,
  }));
  const selectedItems = viewModel.tags.map((tag) => ({
    name: tag,
    id: tag,
  }));

  const handleTagsChange = (selectedItems: MultiSelectItem[]) => {
    const tags = selectedItems
      .map((item) => item.name || '')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    setViewModel((vm) => ({ ...vm, tags }));
  };

  function handleSaveRequest() {
    const updates: Partial<EditorSession> = {
      tags: viewModel.tags,
      queryName: viewModel.name,
      acl: viewModel.acl,
    };

    saveQuery(updates);
  }

  function handleCancel() {
    toggleShowSave();
    resetViewModel();
  }

  return (
    <Modal
      title="Save query"
      width={'500px'}
      visible={showSave}
      onClose={handleCancel}
      initialFocusRef={initialRef}
    >
      <form onSubmit={handleSaveRequest}>
        <label>
          Query name
          <Input
            ref={initialRef}
            error={error}
            placeholder=""
            value={viewModel.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const name = e.target.value;
              setViewModel((vm) => ({ ...vm, name }));
            }}
          />
        </label>

        <Spacer />
        <Spacer />

        <label>
          Tags
          <MultiSelect
            selectedItems={selectedItems}
            options={options}
            onChange={handleTagsChange}
          />
        </label>

        <Spacer />
        <Spacer />

        <ACLInput
          acl={viewModel.acl}
          onChange={(acl) => {
            setViewModel((vm) => ({ ...vm, acl }));
          }}
        />

        <Spacer />
        <Spacer />

        {saveError && <ErrorBlock>{saveError}</ErrorBlock>}

        <div
          style={{
            display: 'flex',
            marginTop: 16,
          }}
        >
          <Button
            type="submit"
            style={{ width: '50%' }}
            variant="primary"
            disabled={isSaving || Boolean(error)}
          >
            Save
          </Button>
          <HSpacer />
          <Button style={{ width: '50%' }} onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default React.memo(QuerySaveModal);
