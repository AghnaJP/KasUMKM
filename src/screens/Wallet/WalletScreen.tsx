import React, {useState, useCallback} from 'react';
import {StyleSheet, SafeAreaView, View, Alert} from 'react-native';
import {useRoute} from '@react-navigation/native';
import TransactionHeader from '../../components/TransactionList/TransactionHeader';
import TransactionSwitcher from '../../components/TransactionList/TransactionSwitcher';
import EditTransactionModal from '../../components/TransactionList/EditTransactionModal';
import {IncomeData, ExpenseData} from '../../types/transaction';
import type {RouteProp} from '@react-navigation/native';
import type {AppTabParamList} from '../../types/navigation';
import {
  deleteExpensesByIds,
  getExpenseDetails,
  updateExpenseDetails,
} from '../../database/Expense/expenseQueries';
import {
  deleteIncomesByIds,
  getIncomeDetails,
  updateIncomeDetails,
} from '../../database/Incomes/incomeQueries';

const WalletScreen = () => {
  const route = useRoute<RouteProp<AppTabParamList, 'Wallet'>>();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<
    IncomeData | ExpenseData | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  React.useEffect(() => {
    const tab = route.params?.initialTab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.initialTab]);

  const getIncomes = useCallback(() => {
    return getIncomeDetails();
  }, []);

  const getExpenses = useCallback(() => {
    return getExpenseDetails();
  }, []);

  const handleEdit = (item: IncomeData | ExpenseData) => {
    setTransactionToEdit(item);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      if (activeTab === 'income') {
        await deleteIncomesByIds([id]);
      } else {
        await deleteExpensesByIds([id]);
      }
      Alert.alert('Sukses', 'Transaksi berhasil dihapus.');
      setRefreshKey(prev => prev + 1);
    } catch {
      Alert.alert('Error', 'Gagal menghapus transaksi.');
    }
  };

  const handleSaveEdit = async (updatedData: {
    description: string;
    price: string;
    quantity: string;
    date: string;
  }) => {
    if (!transactionToEdit) {
      return;
    }
    try {
      const price = parseFloat(updatedData.price);
      const quantity = parseInt(updatedData.quantity, 10);
      const date = updatedData.date;

      if ('menu_id' in transactionToEdit) {
        await updateIncomeDetails(
          transactionToEdit.id,
          updatedData.description,
          price,
          quantity,
          date,
        );
      } else {
        await updateExpenseDetails(
          transactionToEdit.id,
          updatedData.description,
          price,
          quantity,
          date,
        );
      }

      setEditModalVisible(false);
      setTransactionToEdit(null);
      setRefreshKey(prev => prev + 1);
      Alert.alert('Sukses', 'Transaksi berhasil diperbarui.');
    } catch {
      Alert.alert('Error', 'Gagal memperbarui transaksi.');
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <TransactionHeader
          onDeletePress={() => {}}
          onEditPress={() => {}}
          selectionCount={0}
        />
        <TransactionSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getDataFn={activeTab === 'income' ? getIncomes : getExpenses}
          onDataLoaded={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshKey={refreshKey}
        />
      </View>

      {transactionToEdit && (
        <EditTransactionModal
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveEdit}
          transactionData={{
            description: transactionToEdit.description,
            price: transactionToEdit.price,
            quantity: transactionToEdit.quantity,
            date: transactionToEdit.date,
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginVertical: 30,
    marginHorizontal: 14,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  fullWidth: {
    flex: 1,
    width: '100%',
  },
});

export default WalletScreen;
