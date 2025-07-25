import {IncomeItem} from '../../types/menu';
import {IncomeData} from '../../types/transaction';
import {getDBConnection} from '../db';
import {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';

export const getAllIncomes = async (): Promise<IncomeItem[]> => {
  const database: SQLiteDatabase = await getDBConnection();

  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM incomes',
        [],
        (_, result) => {
          const items: IncomeItem[] = [];

          for (let i = 0; i < result.rows.length; i++) {
            items.push(result.rows.item(i));
          }
          resolve(items);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const insertIncome = async (
  menuId: number,
  quantity: number,
  createdAt: string,
  updatedAt: string,
): Promise<void> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise<void>((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'INSERT INTO incomes (menu_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [menuId, quantity, createdAt, updatedAt],
        () => resolve(),
        (_, error) => {
          console.error(
            'SQL Insert Error:',
            error,
            menuId,
            quantity,
            createdAt,
            updatedAt,
          );
          reject(error ?? new Error('Unknown SQL error'));
          return false;
        },
      );
    });
  });
};

export const getIncomeCountByMenuId = async (
  menuId: number,
): Promise<number> => {
  const db = await getDBConnection();
  const [results] = await db.executeSql(
    'SELECT COUNT(*) as count FROM incomes WHERE menu_id = ?',
    [menuId],
  );
  const count = results.rows.item(0).count;
  return count;
};

export const getIncomeDetails = async (): Promise<IncomeData[]> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      const query = `
          SELECT
            i.id,
            i.menu_id,
            COALESCE(i.custom_description, m.name) AS description,
            (COALESCE(i.custom_quantity, i.quantity) * COALESCE(i.custom_price, m.price)) AS amount,
            COALESCE(i.custom_price, m.price) AS price,
            COALESCE(i.custom_created_at, i.created_at) AS date,
            COALESCE(i.custom_quantity, i.quantity) AS quantity
          FROM incomes i
          JOIN menus m ON i.menu_id = m.id
          ORDER BY i.id DESC;
        `;

      tx.executeSql(
        query,
        [],
        (_, results) => {
          const data: IncomeData[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i));
          }
          resolve(data);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteIncomesByIds = async (ids: number[]): Promise<void> => {
  if (ids.length === 0) {
    return Promise.resolve();
  }
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      const placeholders = ids.map(() => '?').join(', ');
      const query = `DELETE FROM incomes WHERE id IN (${placeholders})`;

      tx.executeSql(
        query,
        ids,
        () => resolve(),
        (_, error) => {
          console.error('Gagal menghapus incomes:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

export const updateIncomeDetails = async (
  incomeId: number,
  newDescription: string,
  newPrice: number,
  newQuantity: number,
  newDate: string,
): Promise<void> => {
  const db = await getDBConnection();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `
          UPDATE incomes
          SET
            custom_description = ?,
            custom_price = ?,
            custom_quantity = ?,
            custom_created_at = ?
          WHERE id = ?;
        `;
      tx.executeSql(
        query,
        [newDescription, newPrice, newQuantity, newDate, incomeId],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
