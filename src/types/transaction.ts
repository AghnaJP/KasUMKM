export interface IncomeData {
  id: number;
  menu_id: number;
  description: string;
  amount: number;
  price: number;
  date: string;
}

export interface ExpenseData {
  id: number;
  description: string;
  amount: number;
  price: number;
  date: string;
}

export interface TransactionItem {
  id: number;
  description: string;
  amount: number;
  date: string;
}

export interface EditTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedData: {name: string; price: string; date: string}) => void; // Kita modifikasi sedikit untuk masa depan
  transactionData: {name: string; price: number; date: string} | null; // Kita modifikasi sedikit untuk masa depan
}

export interface TransactionSwitcherProps {
  activeTab: 'income' | 'expense';
  onTabChange: (tab: 'income' | 'expense') => void;
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  refreshKey: number;
  onDataLoaded: (data: (IncomeData | ExpenseData)[]) => void;
}

export interface TransactionHeaderProps {
  onDeletePress: () => void;
  onEditPress: () => void;
  selectionCount: number;
}

export interface TransactionListProps {
  title?: string;
  data: TransactionItem[];
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  totalAmount?: number;
  totalLabel?: string;
}
