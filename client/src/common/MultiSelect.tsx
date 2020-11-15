import { useCombobox, useMultipleSelection } from 'downshift';
import React, { useState } from 'react';
import styles from './MultiSelect.module.css';
import Tag from './Tag';
import { matchSorter } from 'match-sorter';

export interface MultiSelectItem {
  id: string;
  name: string;
}

export interface ItemProps extends React.HTMLProps<HTMLLIElement> {
  isActive?: boolean;
}

const Item = function Item({ isActive, ...rest }: ItemProps) {
  const classNames = [styles.item];
  if (isActive) {
    classNames.push(styles.itemActive);
  }
  return <li className={classNames.join(' ')} {...rest} />;
};

export interface MenuProps extends React.HTMLProps<HTMLUListElement> {
  isOpen?: boolean;
}

export type Ref = HTMLUListElement;

const Menu = React.forwardRef<Ref, MenuProps>(({ isOpen, ...rest }, ref) => {
  const classNames = [styles.menu];
  const style: React.CSSProperties = {};
  if (!isOpen) {
    style.border = 'none';
  }
  return (
    <ul ref={ref} className={classNames.join(' ')} style={style} {...rest} />
  );
});

function getMatchSorterItems(
  allItems: MultiSelectItem[],
  selectedItems: MultiSelectItem[],
  inputValue: string | null
) {
  if (!inputValue) {
    return [];
  }

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
}

/**
 * If anyone out there more familiar with downshift wants to clean this up by all means feel free
 * options should consist of `{ id, name }`.
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
  } = useMultipleSelection({
    initialSelectedItems: props.selectedItems,
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
      props.selectedItems,
      inputValue
    );

    // If input isn't in options or selected items, add it as an item
    const existingOption = options.find(
      (option) =>
        option.name?.trim().toLowerCase() === inputValue.trim().toLowerCase()
    );
    const existingSelection = props.selectedItems.find(
      (item) =>
        item.name?.trim().toLowerCase() === inputValue.trim().toLowerCase()
    );

    if (!existingOption && !existingSelection && inputValue.trim() !== '') {
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
            onKeyDown(event: any) {
              if (event.key === 'Escape' && !isOpen) {
                // https://github.com/downshift-js/downshift/issues/734
                // event.nativeEvent.preventDownshiftDefault = true;
                (event.nativeEvent as any).preventDownshiftDefault = true;
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
