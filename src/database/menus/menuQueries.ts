import {Category, ID, MenuItem} from '../../types/menu';
import {getDBConnection} from '../db';
import {addMenu} from './menuUnified';
import {
  Transaction,
  ResultSet,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';

const isValidCategory = (value: string): value is Category => {
  return value === 'food' || value === 'drink';
};

export const getAllMenus = async (): Promise<MenuItem[]> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM menus WHERE deleted_at IS NULL ORDER BY name ASC',
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

export async function insertMenu(
  name: string,
  category: string,
  price: number,
  occurred_at?: string,
): Promise<number> {
  try {
    const menuId = await addMenu({
      name,
      category: category as 'food' | 'drink',
      price,
      occurred_at,
    });

    console.log(`Menu berhasil ditambahkan dengan ID: ${menuId}`);
    return 1;
  } catch (error) {
    console.error('Error inserting menu:', error);
    throw error;
  }
}

export const updateMenuById = async (
  id: ID,
  name: string,
  price: number,
): Promise<void> => {
  const database = await getDBConnection();
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'UPDATE menus SET name = ?, price = ?, updated_at = ?, dirty = 1 WHERE id = ?',
        [name, price, now, String(id)],
        () => resolve(),
        (_, error) => reject(error),
      );
    });
  });
};

export const deleteMenuById = async (id: ID) => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'DELETE FROM menus WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};
