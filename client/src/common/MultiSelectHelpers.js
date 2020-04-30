import React from 'react';
import matchSorter from 'match-sorter';
import styles from './MultiSelect.module.css';

const Item = function Item({ isActive, isSelected, ...rest }) {
  const classNames = [styles.item];
  if (isActive) {
    classNames.push(styles.itemActive);
  }
  if (isSelected) {
    classNames.push(styles.itemSelected);
  }
  return <li className={classNames.join(' ')} {...rest} />;
};

const Menu = React.forwardRef(({ isOpen, ...rest }, ref) => {
  const classNames = [styles.menu];
  const style = {};
  if (!isOpen) {
    style.border = 'none';
  }
  return (
    <ul ref={ref} className={classNames.join(' ')} style={style} {...rest} />
  );
});

function getItems(allItems, selectedItems, inputValue) {
  const selectedById = {};
  selectedItems.forEach((item) => (selectedById[item.id] = item));

  const unselectedItems = allItems.filter((item) => !selectedById[item.id]);

  return inputValue
    ? matchSorter(unselectedItems, inputValue, {
        keys: ['name'],
      })
    : unselectedItems;
}

export { Menu, Item, getItems };
