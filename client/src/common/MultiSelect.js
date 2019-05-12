import React, { useRef } from 'react';
import Downshift from 'downshift';
import { Menu, Item, getItems } from './MultiSelectHelpers';
import styles from './MultiSelect.module.css';
import CloseIcon from 'mdi-react/CloseIcon';

class MultiDownshift extends React.Component {
  state = { selectedItems: [] };

  stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownArrowUp:
        return {
          ...changes,
          isOpen: state.highlightedIndex === 0 ? false : state.isOpen
        };
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          highlightedIndex: 0,
          isOpen: false,
          inputValue: ''
        };
      default:
        return changes;
    }
  };

  handleSelection = (selectedItem, downshift) => {
    const callOnChange = () => {
      const { onSelect, onChange } = this.props;
      const { selectedItems } = this.state;
      if (onSelect) {
        onSelect(selectedItems, this.getStateAndHelpers(downshift));
      }
      if (onChange) {
        onChange(selectedItems, this.getStateAndHelpers(downshift));
      }
    };
    if (this.state.selectedItems.includes(selectedItem)) {
      this.removeItem(selectedItem, callOnChange);
    } else {
      this.addSelectedItem(selectedItem, callOnChange);
    }
  };

  removeItem = (item, cb) => {
    this.setState(({ selectedItems }) => {
      return {
        selectedItems: selectedItems.filter(i => i !== item)
      };
    }, cb);
  };

  addSelectedItem(item, cb) {
    this.setState(
      ({ selectedItems }) => ({
        selectedItems: [...selectedItems, item]
      }),
      cb
    );
  }

  getRemoveButtonProps = ({ onClick, item, ...props } = {}) => {
    return {
      onClick: e => {
        onClick && onClick(e);
        e.stopPropagation();
        this.removeItem(item);
      },
      ...props
    };
  };

  getStateAndHelpers(downshift) {
    const { selectedItems } = this.state;
    const { getRemoveButtonProps, removeItem } = this;
    return {
      getRemoveButtonProps,
      removeItem,
      selectedItems,
      ...downshift
    };
  }

  render() {
    const { render, children = render, ...props } = this.props;
    return (
      <Downshift
        {...props}
        stateReducer={this.stateReducer}
        onChange={this.handleSelection}
        selectedItem={null}
      >
        {downshift => children(this.getStateAndHelpers(downshift))}
      </Downshift>
    );
  }
}

function MultiSelect({ selectedItems, options, onChange }) {
  const input = useRef();

  const itemToString = item => (item ? item.name : '');

  return (
    <MultiDownshift onChange={onChange} itemToString={itemToString}>
      {({
        getInputProps,
        getMenuProps,
        getRemoveButtonProps,
        removeItem,
        setState,
        selectItem,
        isOpen,
        inputValue,
        selectedItems,
        getItemProps,
        highlightedIndex,
        toggleMenu
      }) => (
        <div style={{ position: 'relative' }}>
          <div
            className={styles.container}
            style={
              isOpen
                ? {
                    borderBottomRightRadius: 0,
                    borderBottomLeftRadius: 0
                  }
                : null
            }
            onClick={() => {
              toggleMenu();
              !isOpen && input.current.focus();
            }}
          >
            {selectedItems.length > 0
              ? selectedItems.map(item => (
                  <div key={item.id} className={styles.tagContainer}>
                    <span>{item.name}</span>
                    <span style={{ width: 6 }} />
                    <button
                      {...getRemoveButtonProps({ item })}
                      className={styles.tagCloseButton}
                    >
                      <CloseIcon size={14} style={{ marginTop: 2 }} />
                    </button>
                  </div>
                ))
              : null}
            <input
              className={styles.input}
              {...getInputProps({
                ref: input,
                onKeyDown(event) {
                  if (
                    event.key === 'Enter' &&
                    inputValue.trim() &&
                    highlightedIndex === null
                  ) {
                    const existingItem = selectedItems.find(
                      i => i.name === inputValue.toLowerCase()
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
                        item =>
                          item.name.toLowerCase() ===
                            inputValue.toLowerCase() ||
                          item.id.toLowerCase() === inputValue.toLowerCase()
                      );

                      if (found) {
                        selectItem(found);
                      } else {
                        selectItem({
                          id: inputValue,
                          name: inputValue
                        });
                      }
                    }

                    setState({
                      inputValue: '',
                      isOpen: false
                    });
                  }
                  if (event.key === 'Backspace' && !inputValue) {
                    removeItem(selectedItems[selectedItems.length - 1]);
                  }
                }
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
                        isSelected: selectedItems.includes(item)
                      })}
                    >
                      {item.name}
                    </Item>
                  )
                )
              : null}
          </Menu>
        </div>
      )}
    </MultiDownshift>
  );
}

export default MultiSelect;
