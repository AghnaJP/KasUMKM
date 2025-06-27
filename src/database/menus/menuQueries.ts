import db from '../db';
import {Transaction, ResultSet} from 'react-native-sqlite-storage';

export const insertMenu = async (
  name: string,
  category: string,
  price: number,
): Promise<void> => {
  const database = await db;
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'INSERT INTO menus (name, category, price) VALUES (?, ?, ?)',
        [name, category, price],
        () => resolve(),
        (_, error) => reject(error),
      );
    });
  });
};

export const getAllMenus = async (): Promise<
  {id: number; name: string; category: string; price: number}[]
> => {
  const database = await db;
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM menus',
        [],
        (_, result: ResultSet) => {
          const menus = [];
          for (let i = 0; i < result.rows.length; i++) {
            menus.push(result.rows.item(i));
          }
          resolve(menus);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
