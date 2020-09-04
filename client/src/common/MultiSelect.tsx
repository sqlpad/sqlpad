import Downshift from 'downshift';
import React, { useRef } from 'react';
import styles from './MultiSelect.module.css';
import { getItems, Item, Menu } from './MultiSelectHelpers';
import Tag from './Tag';

interface Item {
  name?: string;
  id: string;
  component?: any;
}

export interface Props {
  selectedItems: Item[];
  options: Item[];
  onChange: (items: Item[]) => void;
  placeholder?: string;
}

/**
 * This component was quickly hacked together using the Downshift multiselect example
 * A lot of that example was changed and reduced down to what this is here.
 * If anyone out there more familiar with downshift wants to clean this up by all means feel free
 * options should consist of `{ id, name, component }`.
 * name is used for matching, component optional for what to render
 */
function MultiSelect({
  selectedItems = [],
  options,
  onChange,
  placeholder,
}: Props) {
  const input = useRef<HTMLInputElement>(null);

  const itemToString = (item: Item | null) => (item ? item.name || '' : '');

  const stateReducer = (state: any, changes: any) => {
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

  const removeItem = (item: Item) => {
    onChange(selectedItems.filter((i) => i !== item));
  };

  const addSelectedItem = (item: Item, cb: () => void) => {
    onChange([...selectedItems, item]);
  };

  const handleSelection = (selectedItem: Item | null) => {
    const callOnChange = () => {
      onChange(selectedItems);
    };
    if (!selectedItem) {
      return;
    }
    if (selectedItems.includes(selectedItem)) {
      // removeItem(selectedItem, callOnChange);
      removeItem(selectedItem);
    } else {
      addSelectedItem(selectedItem, callOnChange);
    }
  };

  return (
    <Downshift
      itemToString={itemToString}
      stateReducer={stateReducer}
      onChange={handleSelection}
      selectedItem={undefined}
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
                : undefined
            }
            onClick={() => {
              toggleMenu();
              if (!isOpen && input && input.current) {
                input.current.focus();
              }
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
                    inputValue &&
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
                        (item: Item) =>
                          item?.name?.toLowerCase() ===
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
                    // https://github.com/downshift-js/downshift/issues/734
                    // event.nativeEvent.preventDownshiftDefault = true;
                    (event.nativeEvent as any).preventDownshiftDefault = true;
                  }
                },
              })}
            />
          </div>
          <Menu isOpen={isOpen} {...getMenuProps()}>
            {isOpen
              ? getItems(options, selectedItems, inputValue).map(
                  (item, index) => (
                    <Item
                      key={item.id}
                      {...getItemProps({
                        item,
                        index,
                        isSelected: selectedItems.includes(item),
                      })}
                      isActive={highlightedIndex === index}
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
