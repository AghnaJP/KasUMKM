import {Category, MenuItem} from '../../types/menu';
import db from '../db';
import {Transaction, ResultSet} from 'react-native-sqlite-storage';

const isValidCategory = (value: string): value is Category => {
  return value === 'food' || value === 'drink';
};

export const getAllMenus = async (): Promise<MenuItem[]> => {
  const database = await db;
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM menus ORDER BY name DESC',
        [],
        (_, result: ResultSet) => {
          const menus: MenuItem[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const item = result.rows.item(i);
            if (isValidCategory(item.category)) {
              menus.push({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                created_at: item.created_at,
                updated_at: item.updated_at,
              });
            } else {
              console.warn(
                `Invalid category found: ${item.category}, skipping item`,
              );
            }
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

export const insertMenu = async (
  name: string,
  category: string,
  price: number,
): Promise<void> => {
  const database = await db;
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'INSERT INTO menus (name, category, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [name, category, price, now, now],
        () => resolve(),
        (_, error) => reject(error),
      );
    });
  });
};

export const updateMenuById = async (
  id: number,
  name: string,
  price: number,
): Promise<void> => {
  const database = await db;
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'UPDATE menus SET name = ?, price = ?, updated_at = ? WHERE id = ?',
        [name, price, now, id],
        () => resolve(),
        (_, error) => reject(error),
      );
    });
  });
};

export const deleteMenuById = async (id: number) => {
  const dbInstance = await db;
  return new Promise((resolve, reject) => {
    dbInstance.transaction(tx => {
      tx.executeSql(
        'DELETE FROM menus WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};
