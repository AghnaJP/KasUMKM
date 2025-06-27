import {initUserTable} from './users/initUserTable';
import {initMenuTable} from './menus/initMenuTable';

export const initAllTables = async () => {
  await initUserTable();
  await initMenuTable();
  console.log('All tables initialized');
};
