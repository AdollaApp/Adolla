import type { List, ListItem } from '@/modules/db/schema';

export type ListDto = {
  id: string;
  userId: string;
  name: string;
};

export type ListWithItemDto = ListDto & {
  items: ListItemDto[];
};

export type ListItemDto = {
  id: string;
  listId: string;
};

export function mapList(list: List): ListDto {
  return {
    id: list.id,
    userId: list.userId,
    name: list.name,
  };
}

export function mapListWithItems(list: List, items: ListItem[]): ListWithItemDto {
  return {
    ...mapList(list),
    items: items.map(v => mapListItem(v)),
  };
}

export function mapListItem(item: ListItem): ListItemDto {
  return {
    id: item.id,
    listId: item.listId,
  };
}
