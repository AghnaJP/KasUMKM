type ID = number | string;

export interface TransactionData {
  id: ID;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface BaseTransaction {
  id: ID;
  description: string;
  price: number;
  quantity?: number;
  amount: number;
  date: string;
}

export interface IncomeData extends BaseTransaction {
  menu_id: string | null;
}

export interface ExpenseData extends BaseTransaction {}

export type TransactionItem = BaseTransaction;

export const toIdStr = (v: ID) => String(v);
export const toIdNum = (v: ID) =>
  typeof v === 'number' ? v : Number.parseInt(v, 10);
