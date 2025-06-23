import {initUserTable} from './users/initUserTable';
// import { initOrderTable } from './orders/initOrderTable';

export const initAllTables = async () => {
  await initUserTable();
  // await initOrderTable();
};
