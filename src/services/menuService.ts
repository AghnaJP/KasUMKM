import {getAllMenus} from '../database/menus/menuQueries';
import {MenuItem} from '../types/menu';

export const fetchAndFormatMenus = async (): Promise<MenuItem[]> => {
  const data = await getAllMenus();
  return data.map((item: any) => ({
    ...item,
    category:
      item.category === 'Makanan' || item.category === 'food'
        ? ('food' as 'food')
        : ('drink' as 'drink'),
  }));
};
