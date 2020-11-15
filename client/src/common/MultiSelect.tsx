import { useCombobox, useMultipleSelection } from 'downshift';
import React, { useState } from 'react';
import styles from './MultiSelect.module.css';
import Tag from './Tag';
import { matchSorter } from 'match-sorter';

export interface MultiSelectItem {
  id: string;
  name: string;
}

/**
 * Menu - a ul element to contain the options when open
 */
interface MenuProps extends React.HTMLProps<HTMLUListElement> {
  isOpen?: boolean;
}

type MenuRef = HTMLUListElement;

const Menu = React.forwardRef<MenuRef, MenuProps>(
  ({ isOpen, ...rest }, ref) => {
    const classNames = [styles.menu];
    const style: React.CSSProperties = {};
    if (!isOpen) {
      style.border = 'none';
    }
    return (
      <ul ref={ref} className={classNames.join(' ')} style={style} {...rest} />
    );
  }
);

/**
 * MenuItem - an li element for a specific option
 */
interface MenuItemProps extends React.HTMLProps<HTMLLIElement> {
  isActive?: boolean;
}

type MenuItemRef = HTMLLIElement;

const MenuItem = React.forwardRef<MenuItemRef, MenuItemProps>(
  ({ isActive, ...rest }, ref) => {
    const classNames = [styles.item];
    if (isActive) {
      classNames.push(styles.itemActive);
    }
    return <li ref={ref} className={classNames.join(' ')} {...rest} />;
  }
);

/**
 * helper function to get items using matchSorter library
 * @param allItems
 * @param selectedItems
 * @param inputValue
 */
function getMatchSorterItems(
  allItems: MultiSelectItem[],
  selectedItems: MultiSelectItem[],
  inputValue: string
) {
  const selectedById: { [key: string]: MultiSelectItem } = {};
  selectedItems.forEach((item) => (selectedById[item.id] = item));

  const unselectedItems = allItems.filter((item) => !selectedById[item.id]);

  return inputValue
    ? matchSorter(unselectedItems, inputValue, {
        keys: ['name'],
      })
    : unselectedItems;
}

export interface Props {
  selectedItems: MultiSelectItem[];
  options: MultiSelectItem[];
  onChange: (items: MultiSelectItem[]) => void;
  placeholder?: string;
  allowNew?: boolean;
}

/**
 * If anyone out there more familiar with downshift wants to clean this up by all means feel free
 * options should consist of `{ id, name }`.
 */
function MultiSelect(props: Props) {
  const {
    options,
    onChange,
    placeholder,
    allowNew,
    selectedItems: propSelectedItems,
  } = props;

  const [inputValue, setInputValue] = useState('');

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection({
    initialSelectedItems: propSelectedItems,
    onSelectedItemsChange: (changes) => {
      if (changes.selectedItems) {
        onChange(changes.selectedItems);
      } else {
        onChange([]);
      }
    },
  });

  const getFilteredItems = () => {
    const filteredItems = getMatchSorterItems(
      options,
      propSelectedItems,
      inputValue
    );

    // If input isn't in options or selected items, add it as an item
    const existingOption = options.find(
      (option) =>
        option.name?.trim().toLowerCase() === inputValue.trim().toLowerCase()
    );
    const existingSelection = propSelectedItems.find(
      (item) =>
        item.name?.trim().toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (
      allowNew &&
      !existingOption &&
      !existingSelection &&
      inputValue.trim() !== ''
    ) {
      const userOption: MultiSelectItem = { id: inputValue, name: inputValue };
      return [userOption].concat(filteredItems);
    }

    return filteredItems;
  };

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
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
    onStateChange: ({ inputValue, type, selectedItem, ...rest }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue || '');
          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            addSelectedItem(selectedItem);
          }
          setInputValue('');
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
            {selectedItem.name}
          </Tag>
        ))}

        <input
          className={styles.input}
          placeholder={placeholder}
          {...getInputProps({
            onKeyDown(event) {
              // Don't propagate the escape key press - it could close modals or drawers
              // We just want it to close the suggestion box
              if (event.key === 'Escape' && isOpen) {
                event.stopPropagation();
              }
            },
            ...getDropdownProps({
              preventKeyAction: isOpen,
            }),
            // For some reason the input blur state change doesn't happen consistently in the onStateChange function
            // This could be something I am doing messing with other things
            // To ensure input is cleared of any unselected partial value on blur, clear input here as well
            onBlur() {
              setInputValue('');
            },
          })}
        />
      </div>
      <Menu {...getMenuProps()} style={{}}>
        {isOpen &&
          getFilteredItems().map((item, index) => (
            <MenuItem
              isActive={highlightedIndex === index}
              key={`${item.name}${index}`}
              {...getItemProps({ item, index })}
            >
              {item.name}
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
}

export default MultiSelect;
