import React, { ChangeEvent, useRef } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import MultiSelect, { MultiSelectItem } from '../common/MultiSelect';
import Spacer from '../common/Spacer';
import {
  saveQuery,
  setAcl,
  setQueryName,
  setTags,
  toggleShowSave,
} from '../stores/editor-actions';
import {
  useSessionIsSaving,
  useSessionQueryName,
  useSessionQueryShared,
  useSessionShowValidation,
  useSessionTags,
  useShowSave,
} from '../stores/editor-store';
import { api } from '../utilities/api';

// TODO: Add option between updating existing query, or saving new query (maybe)
// TODO: If save error occurs, display it in modal
// TODO: Enhance share options
// TODO: Make modal state temporary until saved. Edits should be able to be cancelled.

function QuerySaveModal() {
  const showSave = useShowSave();
  const shared = useSessionQueryShared();
  const tags = useSessionTags();
  const queryName = useSessionQueryName();
  const showValidation = useSessionShowValidation();
  const isSaving = useSessionIsSaving();
  const initialRef = useRef(null);

  const error = showValidation && !queryName.length;

  const { data: tagsData } = api.useTags(showSave);
  const options = (tagsData || []).map((tag) => ({
    name: tag,
    id: tag,
  }));
  const selectedItems = tags.map((tag) => ({
    name: tag,
    id: tag,
  }));

  const handleTagsChange = (selectedItems: MultiSelectItem[]) => {
    const tags = selectedItems
      .map((item) => item.name || '')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    setTags(tags);
  };

  function handleSharedChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    if (value === 'shared') {
      setAcl([{ groupId: '__EVERYONE__', write: true }]);
    } else if (value === 'private') {
      setAcl([]);
    }
  }

  return (
    <Modal
      title="Save query"
      width={'500px'}
      visible={showSave}
      onClose={toggleShowSave}
      initialFocusRef={initialRef}
    >
      <label>
        Query name
        <Input
          ref={initialRef}
          error={error}
          placeholder=""
          value={queryName}
          onChange={(e: any) => setQueryName(e.target.value)}
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
          checked={!shared}
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
          checked={shared}
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
      <Spacer />

      <Button
        className="w-100"
        variant="primary"
        disabled={isSaving || Boolean(error)}
        onClick={() => saveQuery()}
      >
        Save
      </Button>
    </Modal>
  );
}

export default React.memo(QuerySaveModal);
