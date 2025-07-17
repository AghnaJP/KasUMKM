export interface TransactionData {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface BaseTransaction {
  id: number;
  description: string;
  price: number;
  quantity?: number;
  amount: number;
  date: string;
}

export interface IncomeData extends BaseTransaction {
  menu_id: number;
}

export interface ExpenseData extends BaseTransaction {}

export type TransactionItem = BaseTransaction;
