import Downshift from 'downshift';
import React, { useRef } from 'react';
import styles from './MultiSelect.module.css';
import { getItems, Item, Menu } from './MultiSelectHelpers';
import Tag from './Tag';

/**
 * This component was quickly hacked together using the Downshift multiselect example
 * A lot of that example was changed and reduced down to what this is here.
 * If anyone out there more familiar with downshift wants to clean this up by all means feel free
 * options should consist of `{ id, name, component }`.
 * name is used for matching, component optional for what to render
 */
function MultiSelect({ selectedItems = [], options, onChange, placeholder }) {
  const input = useRef();

  const itemToString = (item) => (item ? item.name : '');

  const stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownArrowUp:
        return {
          ...changes,
          isOpen: state.highlightedIndex === 0 ? false : state.isOpen,
        };
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          highlightedIndex: 0,
          isOpen: false,
          inputValue: '',
        };
      default:
        return changes;
    }
  };

  const removeItem = (item) => {
    onChange(selectedItems.filter((i) => i !== item));
  };

  const handleSelection = (selectedItem) => {
    const callOnChange = () => {
      onChange(selectedItems);
    };
    if (selectedItems.includes(selectedItem)) {
      removeItem(selectedItem, callOnChange);
    } else {
      addSelectedItem(selectedItem, callOnChange);
    }
  };

  const addSelectedItem = (item, cb) => {
    onChange([...selectedItems, item]);
  };

  return (
    <Downshift
      itemToString={itemToString}
      stateReducer={stateReducer}
      onChange={handleSelection}
      selectedItem={null}
    >
      {({
        getInputProps,
        getMenuProps,
        setState,
        selectItem,
        isOpen,
        inputValue,
        getItemProps,
        highlightedIndex,
        toggleMenu,
      }) => (
        <div style={{ position: 'relative' }}>
          <div
            className={styles.container}
            style={
              isOpen
                ? {
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0,
                  }
                : null
            }
            onClick={() => {
              toggleMenu();
              !isOpen && input.current.focus();
            }}
          >
            {selectedItems.length > 0
              ? selectedItems.map((item) => (
                  <Tag key={item.id} onClose={() => removeItem(item)}>
                    {item.component || item.name}
                  </Tag>
                ))
              : null}
            <input
              className={styles.input}
              placeholder={placeholder}
              {...getInputProps({
                ref: input,
                onKeyDown(event) {
                  if (
                    event.key === 'Enter' &&
                    inputValue.trim() &&
                    highlightedIndex === null
                  ) {
                    const existingItem = selectedItems.find(
                      (i) => i.name === inputValue.toLowerCase()
                    );

                    // If there isn't an existing item selected already
                    // try to find the item in the list that would be presented to user
                    // If we can find it there, select that, otherwise add a new item
                    if (!existingItem) {
                      const items = getItems(
                        options,
                        selectedItems,
                        inputValue
                      );
                      const found = items.find(
                        (item) =>
                          item.name.toLowerCase() ===
                            inputValue.toLowerCase() ||
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

                    setState({
                      inputValue: '',
                      isOpen: false,
                    });
                  }
                  if (event.key === 'Backspace' && !inputValue) {
                    removeItem(selectedItems[selectedItems.length - 1]);
                  }
                  if (event.key === 'Escape' && !isOpen) {
                    event.nativeEvent.preventDownshiftDefault = true;
                  }
                },
              })}
            />
          </div>
          <Menu {...getMenuProps({ isOpen })}>
            {isOpen
              ? getItems(options, selectedItems, inputValue).map(
                  (item, index) => (
                    <Item
                      key={item.id}
                      {...getItemProps({
                        item,
                        index,
                        isActive: highlightedIndex === index,
                        isSelected: selectedItems.includes(item),
                      })}
                    >
                      {item.component || item.name}
                    </Item>
                  )
                )
              : null}
          </Menu>
        </div>
      )}
    </Downshift>
  );
}

export default MultiSelect;
