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
  useSessionIsSaving,
  useSessionQueryName,
  useSessionQueryShared,
  useSessionSaveError,
  useSessionShowValidation,
  useSessionTags,
  useShowSave,
} from '../stores/editor-store';
import { api } from '../utilities/api';

// TODO: Add option between updating existing query, or saving new query (maybe)
// TODO: Enhance share options

// Instead of modelling the data as it is in the editor session
// a separate view model is used to track state
// Session data converts to it, and on save it gets transformed back to expected format
interface ViewModel {
  name: string;
  shared: 'shared' | 'private';
  tags: string[];
}

function QuerySaveModal() {
  const showSave = useShowSave();
  const originalShared = useSessionQueryShared();
  const originalTags = useSessionTags();
  const originalName = useSessionQueryName();
  const showValidation = useSessionShowValidation();
  const isSaving = useSessionIsSaving();
  const saveError = useSessionSaveError();
  const initialRef = useRef(null);

  const [viewModel, setViewModel] = useState<ViewModel>({
    name: originalName,
    shared: originalShared ? 'shared' : 'private',
    tags: originalTags || [],
  });

  function resetViewModel() {
    setViewModel({
      name: originalName,
      shared: originalShared ? 'shared' : 'private',
      tags: originalTags || [],
    });
  }

  useEffect(() => {
    setViewModel((vm) => ({ ...vm, name: originalName }));
  }, [originalName]);

  useEffect(() => {
    setViewModel((vm) => ({
      ...vm,
      shared: originalShared ? 'shared' : 'private',
    }));
  }, [originalShared]);

  useEffect(() => {
    setViewModel((vm) => ({
      ...vm,
      tags: originalTags || [],
    }));
  }, [originalTags]);

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

  function handleSharedChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    if (value === 'shared' || value === 'private') {
      return setViewModel((vm) => ({ ...vm, shared: value }));
    }
    throw new Error('Unknown value ' + value);
  }

  function handleSaveRequest() {
    const updates: Partial<EditorSession> = {
      tags: viewModel.tags,
      queryName: viewModel.name,
      acl: [],
    };
    if (viewModel.shared === 'shared') {
      updates.acl = [{ groupId: '__EVERYONE__', write: true }];
    }

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

        <label>Sharing</label>
        <Spacer />

        <label htmlFor="private" style={{ display: 'block', width: '100%' }}>
          <input
            style={{ marginRight: 8 }}
            id="private"
            type="radio"
            checked={viewModel.shared === 'private'}
            value="private"
            onChange={handleSharedChange}
          />
          Private
        </label>
        <Spacer />

        <label htmlFor="shared" style={{ display: 'block', width: '100%' }}>
          <input
            style={{ marginRight: 8 }}
            id="shared"
            type="radio"
            value="shared"
            checked={viewModel.shared === 'shared'}
            onChange={handleSharedChange}
          />
          Shared
        </label>

        {/* 
          TODO expand on sharing options. 
          Can be shared with specific users.
          Everyone can be read or write.
        */}

        <Spacer />

        {saveError && <ErrorBlock>{saveError}</ErrorBlock>}

        <div
          style={{
            display: 'flex',
            borderTop: '1px solid #ddd',
            marginTop: 16,
          }}
        >
          <Button
            type="submit"
            style={{ width: '50%' }}
            variant="primary"
            disabled={isSaving || Boolean(error)}
            onClick={() => handleSaveRequest()}
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
