import type { List, ListItem, MangaMetaDb } from '@/modules/db/schema';
import type { MangaMetaDbDto } from './meta';
import { mapMangaMetaDb } from './meta';

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
  mangaId: string;
  mangaMeta: MangaMetaDbDto;
};

export function mapList(list: List): ListDto {
  return {
    id: list.id,
    userId: list.userId,
    name: list.name,
  };
}

export function mapListWithItems(list: List, items: (ListItem & { mangaMeta: MangaMetaDb })[]): ListWithItemDto {
  return {
    ...mapList(list),
    items: items.map(v => mapListItem(v, v.mangaMeta)),
  };
}

export function mapListItem(item: ListItem, meta: MangaMetaDb): ListItemDto {
  return {
    id: item.id,
    listId: item.listId,
    mangaId: item.mangaId,
    mangaMeta: mapMangaMetaDb(meta),
  };
}
