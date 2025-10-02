export type ID = number | string;
export interface MenuItem {
  id: ID;
  name: string;
  price: number;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface IncomeItem {
  id: ID;
  menu_id: string | null;
  quantity: number;
  created_at: string;
}

export interface ExpenseItem {
  id: ID;
  description: string;
  price: number;
  quantity: number;
  created_at: string;
}

export const CATEGORIES = [
  {label: 'Makanan', value: 'food'},
  {label: 'Minuman', value: 'drink'},
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];
export type CategoryWithEmpty = Category | '';

export const toIdStr = (v: ID) => String(v);
export const toIdNum = (v: ID) =>
  typeof v === 'number' ? v : Number.parseInt(v, 10);
