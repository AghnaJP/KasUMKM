import {getDBConnection} from '../db';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {IncomeData} from '../../types/transaction';

const getIncomeDetails = async (): Promise<IncomeData[]> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      // Query ini diperbarui untuk menangani data lama dan baru
      const query = `
        SELECT
          i.id,
          i.menu_id,
          COALESCE(i.description, m.name) AS description,
          COALESCE(i.price, m.price) AS price,
          (i.quantity * COALESCE(i.price, m.price)) AS amount,
          i.created_at AS date
        FROM incomes i
        LEFT JOIN menus m ON i.menu_id = m.id
        ORDER BY i.created_at DESC;
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
          console.error('Gagal mengambil detail income:', error);
          reject(new Error('Gagal mengambil detail income.'));
          return false;
        },
      );
    });
  });
};

const updateIncomeTransaction = async (
  id: number,
  newDescription: string,
  newPrice: number,
  newDate: string,
): Promise<void> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      const query =
        'UPDATE incomes SET description = ?, price = ?, created_at = ? WHERE id = ?';
      tx.executeSql(
        query,
        [newDescription, newPrice, newDate, id],
        () => resolve(),
        (_, error) => {
          console.error('Gagal update transaksi income:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

const deleteIncomesByIds = async (ids: number[]): Promise<void> => {
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

export const IncomeListService = {
  getIncomeDetails,
  updateIncomeTransaction,
  deleteIncomesByIds,
};
