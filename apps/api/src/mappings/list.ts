import type { List, ListItem } from '@/modules/db/schema';

export type ListDto = {
  id: string;
  userId: string;
  name: string;
};

export type ListItemDto = {
  id: string;
  listId: string;
};

export function mapList(item: List): ListDto {
  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
  };
}

export function mapListItem(item: ListItem): ListItemDto {
  return {
    id: item.id,
    listId: item.listId,
  };
}
