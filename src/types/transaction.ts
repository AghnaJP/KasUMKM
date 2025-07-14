export interface TransactionData {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}
