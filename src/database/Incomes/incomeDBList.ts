import {getDBConnection} from '../db';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

export interface IncomeData {
  id: number;
  menu_id: number;
  description: string;
  amount: number;
  price: number;
  date: string;
}

export const IncomeListService = {
  getIncomeDetails: async (): Promise<IncomeData[]> => {
    const database: SQLiteDatabase = await getDBConnection();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        const query = `
          SELECT
            i.id,
            i.menu_id,
            m.name AS description,
            (i.quantity * m.price) AS amount,
            m.price,
            i.created_at AS date
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
};
