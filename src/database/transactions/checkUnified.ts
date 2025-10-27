import {getDBConnection} from '../db';

export async function checkTodayTransactionsUnified(): Promise<{
  hasIncome: boolean;
  hasExpense: boolean;
}> {
  const db = await getDBConnection();

  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = now.getUTCMonth();
  const dd = now.getUTCDate();

  const startISO = new Date(Date.UTC(yyyy, mm, dd, 0, 0, 0)).toISOString();
  const endISO = new Date(Date.UTC(yyyy, mm, dd + 1, 0, 0, 0)).toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) AS c
           FROM transactions
          WHERE deleted_at IS NULL
            AND type='INCOME'
            AND occurred_at >= ? AND occurred_at < ?`,
        [startISO, endISO],
        (_, incomeRes) => {
          const incomeCount = incomeRes.rows.item(0).c ?? 0;

          tx.executeSql(
            `SELECT COUNT(*) AS c
               FROM transactions
              WHERE deleted_at IS NULL
                AND type='EXPENSE'
                AND occurred_at >= ? AND occurred_at < ?`,
            [startISO, endISO],
            (__, expenseRes) => {
              const expenseCount = expenseRes.rows.item(0).c ?? 0;
              resolve({
                hasIncome: incomeCount > 0,
                hasExpense: expenseCount > 0,
              });
            },
            (__, err2) => {
              console.error('Error checking unified expenses:', err2);
              reject(err2 || new Error('Failed to check unified expenses'));
              return false;
            },
          );
        },
        (_, err1) => {
          console.error('Error checking unified incomes:', err1);
          reject(err1 || new Error('Failed to check unified incomes'));
          return false;
        },
      );
    });
  });
}
