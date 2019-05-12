// You'll find that downshift is a primitive component and
// you'll be most successful wrapping it with another component
// like the MultiDownshift one you see here:

import React from 'react';
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

  addItem = (item, cb) => {
    this.setState(({ selectedItems }) => {
      const existingItem = selectedItems.find(i => i.name === item.name);
      if (!existingItem) {
        return {
          selectedItems: [...selectedItems, item]
        };
      }
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
        // TODO: use something like downshift's composeEventHandlers utility instead
        onClick && onClick(e);
        e.stopPropagation();
        this.removeItem(item);
      },
      ...props
    };
  };

  getStateAndHelpers(downshift) {
    const { selectedItems } = this.state;
    const { getRemoveButtonProps, removeItem, addItem } = this;
    return {
      getRemoveButtonProps,
      removeItem,
      selectedItems,
      addItem,
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

class App extends React.Component {
  input = React.createRef();
  itemToString = item => (item ? item.name : '');
  handleChange = selectedItems => {
    console.log({ selectedItems });
  };
  render() {
    return (
      <MultiDownshift
        onChange={this.handleChange}
        itemToString={this.itemToString}
      >
        {({
          getInputProps,
          getMenuProps,
          // note that the getRemoveButtonProps prop getter and the removeItem
          // action are coming from MultiDownshift composibility for the win!
          getRemoveButtonProps,
          removeItem,

          setState,

          addItem,

          isOpen,
          inputValue,
          selectedItems,
          getItemProps,
          highlightedIndex,
          toggleMenu
        }) => (
          <div style={{ width: 500, margin: 'auto', position: 'relative' }}>
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
                !isOpen && this.input.current.focus();
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
                  ref: this.input,
                  onKeyDown(event) {
                    if (
                      event.key === 'Enter' &&
                      inputValue.trim() &&
                      highlightedIndex === null
                    ) {
                      addItem({
                        id: inputValue,
                        name: inputValue
                      });
                      setState({
                        inputValue: ''
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
                ? getItems(inputValue).map((item, index) => (
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
                  ))
                : null}
            </Menu>
          </div>
        )}
      </MultiDownshift>
    );
  }
}

export default App;
