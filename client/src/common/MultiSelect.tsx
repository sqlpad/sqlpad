import Downshift from 'downshift';
import React, { useRef, useState } from 'react';
import styles from './MultiSelect.module.css';
import { getItems, Item, Menu } from './MultiSelectHelpers';
import Tag from './Tag';
import { useCombobox, useMultipleSelection } from 'downshift';

export interface MultiSelectItem {
  name?: string;
  id: string;
  component?: any;
}

export interface Props {
  selectedItems: MultiSelectItem[];
  options: MultiSelectItem[];
  onChange: (items: MultiSelectItem[]) => void;
  placeholder?: string;
}

/**
 * This component was quickly hacked together using the Downshift multiselect example
 * A lot of that example was changed and reduced down to what this is here.
 * If anyone out there more familiar with downshift wants to clean this up by all means feel free
 * options should consist of `{ id, name, component }`.
 * name is used for matching, component optional for what to render
 * TODO fix or replace with https://github.com/i-like-robots/react-tags
 */
function MultiSelect(props: Props) {
  // const { selectedItems = [], options, onChange, placeholder } = props;
  const { options, onChange, placeholder } = props;

  const [inputValue, setInputValue] = useState('');

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({ initialSelectedItems: props.selectedItems });

  const getFilteredItems = () =>
    options.filter(
      (item) =>
        selectedItems.indexOf(item) < 0 &&
        item?.name?.toLowerCase().startsWith(inputValue.toLowerCase())
    );

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    selectItem,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0, // after selection, highlight the first item.
    selectedItem: null,
    items: getFilteredItems(),
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: false, // close the menu open after selection.
          };
      }
      return changes;
    },
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue || '');
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setInputValue('');
            addSelectedItem(selectedItem);
          }
          break;
        default:
          break;
      }
    },
  });

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={styles.container}
        style={
          isOpen
            ? {
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
              }
            : undefined
        }
        {...getComboboxProps()}
      >
        {selectedItems.map((selectedItem, index) => (
          <Tag
            {...getSelectedItemProps({ selectedItem, index })}
            key={`selected-item-${index}`}
            onClose={() => removeSelectedItem(selectedItem)}
          >
            {selectedItem.component || selectedItem.name}
          </Tag>
        ))}

        <input
          className={styles.input}
          placeholder={placeholder}
          {...getInputProps({
            onKeyDown(event: any) {
              if (
                event.key === 'Enter'
                // &&
                // inputValue &&
                // inputValue.trim() &&
                // highlightedIndex === null
              ) {
                console.log('on enter');
                console.log(inputValue);
                console.log(highlightedIndex);
                console.log(isOpen);
                const existingItem = selectedItems.find(
                  (i) => i.name === inputValue.toLowerCase()
                );

                // If there isn't an existing item selected already
                // try to find the item in the list that would be presented to user
                // If we can find it there, select that, otherwise add a new item
                if (!existingItem) {
                  console.log('no existing item');
                  const items = getItems(options, selectedItems, inputValue);
                  const found = items.find(
                    (item: MultiSelectItem) =>
                      item?.name?.toLowerCase() === inputValue.toLowerCase() ||
                      item.id.toLowerCase() === inputValue.toLowerCase()
                  );

                  if (found) {
                    selectItem(found);
                  } else {
                    selectItem({
                      id: inputValue,
                      name: inputValue,
                    });
                  }
                }
              }

              if (event.key === 'Escape' && isOpen) {
                event.stopPropagation();
              }
            },
            ...getDropdownProps({
              preventKeyAction: isOpen,
            }),
          })}
        />
      </div>
      <Menu {...getMenuProps()} style={{}}>
        {isOpen &&
          getFilteredItems().map((item, index) => (
            <Item
              isActive={highlightedIndex === index}
              key={`${item.name}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.name}
            </Item>
          ))}
      </Menu>
    </div>
  );
}

export default MultiSelect;
