// src/database/transactions/transactionQueriesUnified.ts
import {executeSql} from '../db';
import {MONTHS} from '../../constants/months';
import type {TransactionData} from '../../types/transaction';

/**
 * Ambil transaksi dari tabel unified (transactions) untuk 1 bulan,
 * tetapi dikembalikan dalam shape lama { id:number, name, amount, date, type }
 * dengan `id` diisi dari SQLite `rowid` (numeric) agar kompatibel.
 */
export async function getAllTransactionsByMonth(
  month0: number, // 0..11
  year: number,
): Promise<TransactionData[]> {
  const start = new Date(Date.UTC(year, month0, 1, 0, 0, 0)).toISOString();
  const end = new Date(Date.UTC(year, month0 + 1, 1, 0, 0, 0)).toISOString();

  // NOTE:
  // - `rowid AS id` -> numeric id untuk kompatibilitas tipe lama
  // - CAST type ke lowercase 'income'/'expense' agar cocok UI lama
  const res = await executeSql(
    `SELECT 
        rowid AS id,
        name,
        CASE type WHEN 'INCOME' THEN 'income' ELSE 'expense' END AS type,
        amount,
        occurred_at AS date
     FROM transactions
     WHERE deleted_at IS NULL
       AND occurred_at >= ? AND occurred_at < ?
     ORDER BY occurred_at DESC`,
    [start, end],
  );

  // rows sudah sesuai shape TransactionData lama
  return res.rows._array as TransactionData[];
}

/**
 * Adapter supaya signature tetap sama dengan hook lama:
 * terima (monthName, year, setLoadedCb) dan balikan TransactionData[]
 */
export async function getAllTransactionsUnified(
  monthName: string,
  year: number,
  setLoadedCb?: (rows: TransactionData[]) => void,
): Promise<TransactionData[]> {
  const month0 = MONTHS.findIndex(
    m => m.toLowerCase() === monthName.toLowerCase(),
  );
  const idx = month0 >= 0 ? month0 : new Date().getMonth();

  const list = await getAllTransactionsByMonth(idx, year);
  if (setLoadedCb) setLoadedCb(list);
  return list;
}
