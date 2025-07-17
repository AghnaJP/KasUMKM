import {getDBConnection} from '../db';
import {SQLiteDatabase} from 'react-native-sqlite-storage';
import {IncomeData} from '../../types/transaction';

export const IncomeListService = {
  getIncomeDetails: async (): Promise<IncomeData[]> => {
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
  },

  updateMenuDetails: async (
    menuId: number,
    newName: string,
    newPrice: number,
  ): Promise<void> => {
    const database: SQLiteDatabase = await getDBConnection();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        const query = `
          UPDATE menus
          SET name = ?, price = ?
          WHERE id = ?;
        `;
        tx.executeSql(
          query,
          [newName, newPrice, menuId],
          () => resolve(),
          (_, error) => {
            console.error('Gagal update menu:', error);
            reject(error);
            return false;
          },
        );
      });
    });
  },

  deleteIncomesByIds: async (ids: number[]): Promise<void> => {
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
  },

  updateIncomeDetails: async (
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
  },
};
