import {getDBConnection} from '../db';
import {TransactionData} from '../../types/transaction';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

export async function getAllTransactions(): Promise<TransactionData[]> {
  const db: SQLiteDatabase = await getDBConnection();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `
        SELECT
          i.id,
          COALESCE(i.custom_description, m.name) AS name,
          (COALESCE(i.custom_quantity, i.quantity) * COALESCE(i.custom_price, m.price)) AS amount,
          COALESCE(i.custom_created_at, i.created_at) AS date,
          'income' AS type
        FROM incomes i
        JOIN menus m ON i.menu_id = m.id

        UNION ALL

        SELECT
          e.id,
          COALESCE(e.custom_description, e.description) AS name,
          (COALESCE(e.custom_quantity, e.quantity) * COALESCE(e.custom_price, e.price)) AS amount,
          COALESCE(e.custom_created_at, e.created_at) AS date,
          'expense' AS type
        FROM expenses e

        ORDER BY date DESC;
      `;

      tx.executeSql(
        query,
        [],
        (_, resultSet) => {
          const data: TransactionData[] = [];
          const rows = resultSet.rows;
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          resolve(data);
        },
        (_, error) => {
          console.error('Failed to fetch all transactions:', error);
          reject(error);
          return false;
        },
      );
    });
  });
}
