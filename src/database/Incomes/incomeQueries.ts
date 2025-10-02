import {ID, IncomeItem} from '../../types/menu';
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
  menuId: ID | null,
  quantity: number,
  createdAt: string,
  updatedAt: string,
): Promise<number> => {
  const db = await getDBConnection();
  return new Promise<number>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO incomes (menu_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [menuId, quantity, createdAt, updatedAt],
        (_, res) => resolve(Number(res.insertId)),
        (_, err) => {
          reject(err);
          return false;
        },
      );
    });
  });
};

export const getIncomeCountByMenuId = async (menuId: ID): Promise<number> => {
  const db = await getDBConnection();
  const id = String(menuId);
  const [results] = await db.executeSql(
    'SELECT COUNT(*) as count FROM incomes WHERE menu_id = ?',
    [id],
  );
  return results.rows.item(0).count ?? 0;
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
          LEFT JOIN menus m ON i.menu_id = m.id
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
  const formattedDate = new Date(newDate).toISOString();
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
        [newDescription, newPrice, newQuantity, formattedDate, incomeId],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
