export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface IncomeItem {
  id: number;
  menu_id: number;
  quantity: number;
  created_at: string;
}

export interface ExpenseItem {
  id: number;
  description: string;
  price: number;
  quantity: number;
}

export const CATEGORIES = [
  {label: 'Makanan', value: 'food'},
  {label: 'Minuman', value: 'drink'},
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];
export type CategoryWithEmpty = Category | '';
