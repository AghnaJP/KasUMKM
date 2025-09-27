// src/database/transactions/transactionQueriesUnified.ts
import {executeSql, rowsToArray} from '../db';
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
  const rs = await executeSql(
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
  return rowsToArray(rs) as TransactionData[];
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

export async function getMonthlyTotalsUnified(
  month: string | number,
  year: number,
): Promise<{income: number; expense: number}> {
  const mIdx =
    typeof month === 'number'
      ? month
      : isNaN(Number(month))
      ? MONTHS.findIndex(m => m.toLowerCase() === String(month).toLowerCase())
      : Number(month) - 1;

  const mm = String(mIdx + 1).padStart(2, '0');
  const yyyy = String(year);

  const rs = await executeSql(
    `
    SELECT
      IFNULL(SUM(CASE WHEN type='INCOME' THEN amount END), 0) as income,
      IFNULL(SUM(CASE WHEN type='EXPENSE' THEN amount END), 0) as expense
    FROM transactions
    WHERE deleted_at IS NULL
      AND strftime('%m', occurred_at) = ?
      AND strftime('%Y', occurred_at) = ?
    `,
    [mm, yyyy],
  );

  const [row] = rowsToArray(rs) as Array<{income: number; expense: number}>;
  return {income: row?.income ?? 0, expense: row?.expense ?? 0};
}

export async function getSeriesUnified(
  period: 'Hari' | 'Minggu' | 'Bulan' | 'Tahun',
  type: 'income' | 'expense',
  opts: {month?: string | number; year?: number} = {},
): Promise<{labels: string[]; data: number[]}> {
  const now = new Date();
  const year = opts.year ?? now.getFullYear();
  const typeSql = type === 'income' ? 'INCOME' : 'EXPENSE';

  if (period === 'Hari') {
    const mIdx =
      typeof opts.month === 'number'
        ? opts.month
        : isNaN(Number(opts.month))
        ? now.getMonth()
        : Number(opts.month) - 1;

    const mm = String(mIdx + 1).padStart(2, '0');
    const yyyy = String(year);

    const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => String(i + 1));
    const data = new Array(daysInMonth).fill(0);

    const rs = await executeSql(
      `
      SELECT strftime('%d', occurred_at) as d, SUM(amount) as total
      FROM transactions
      WHERE deleted_at IS NULL
        AND type = ?
        AND strftime('%m', occurred_at) = ?
        AND strftime('%Y', occurred_at) = ?
      GROUP BY d
      `,
      [typeSql, mm, yyyy],
    );

    const rows = rowsToArray(rs) as Array<{d: string; total: number}>;
    rows.forEach(r => {
      const idx = Number(r.d) - 1;
      if (idx >= 0 && idx < data.length) data[idx] = r.total || 0;
    });

    return {labels, data};
  }

  if (period === 'Minggu') {
    const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const data = new Array(7).fill(0);

    const today = new Date();
    const distToMon = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - distToMon);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const rs = await executeSql(
      `
      SELECT occurred_at, amount
      FROM transactions
      WHERE deleted_at IS NULL
        AND type = ?
        AND occurred_at BETWEEN ? AND ?
      `,
      [typeSql, start.toISOString(), end.toISOString()],
    );

    const rows = rowsToArray(rs) as Array<{
      occurred_at: string;
      amount: number;
    }>;
    rows.forEach(r => {
      const d = new Date(r.occurred_at);
      const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
      data[idx] += r.amount || 0;
    });

    return {labels, data};
  }

  if (period === 'Bulan') {
    const labels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];
    const data = new Array(12).fill(0);
    const yyyy = String(year);

    const rs = await executeSql(
      `
      SELECT strftime('%m', occurred_at) as m, SUM(amount) as total
      FROM transactions
      WHERE deleted_at IS NULL
        AND type = ?
        AND strftime('%Y', occurred_at) = ?
      GROUP BY m
      `,
      [typeSql, yyyy],
    );

    const rows = rowsToArray(rs) as Array<{m: string; total: number}>;
    rows.forEach(r => {
      const idx = Number(r.m) - 1;
      if (idx >= 0 && idx < 12) data[idx] = r.total || 0;
    });

    return {labels, data};
  }

  const rs = await executeSql(
    `
    SELECT strftime('%Y', occurred_at) as y, SUM(amount) as total
    FROM transactions
    WHERE deleted_at IS NULL
      AND type = ?
    GROUP BY y
    ORDER BY y ASC
    `,
    [typeSql],
  );

  const rows = rowsToArray(rs) as Array<{y: string; total: number}>;
  return {labels: rows.map(r => r.y), data: rows.map(r => r.total || 0)};
}
