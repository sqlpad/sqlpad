import React from 'react';
import { matchSorter } from 'match-sorter';
import styles from './MultiSelect.module.css';

export interface ItemProps extends React.HTMLProps<HTMLLIElement> {
  isActive?: boolean;
  isSelected?: boolean;
}

const Item = function Item({ isActive, isSelected, ...rest }: ItemProps) {
  const classNames = [styles.item];
  if (isActive) {
    classNames.push(styles.itemActive);
  }
  if (isSelected) {
    classNames.push(styles.itemSelected);
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

interface ItemT {
  id: string;
  name?: string;
  component?: any;
}

function getItems(
  allItems: ItemT[],
  selectedItems: ItemT[],
  inputValue: string | null
) {
  const selectedById: { [key: string]: ItemT } = {};
  selectedItems.forEach((item) => (selectedById[item.id] = item));

  const unselectedItems = allItems.filter((item) => !selectedById[item.id]);

  return inputValue
    ? matchSorter(unselectedItems, inputValue, {
        keys: ['name'],
      })
    : unselectedItems;
}

export { Menu, Item, getItems };
