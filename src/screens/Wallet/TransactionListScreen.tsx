import React, {useState, useEffect} from 'react';
import {StyleSheet, SafeAreaView, View, Alert} from 'react-native';
import TransactionHeader from '../../components/TransactionList/TransactionHeader';
import TransactionSwitcher from '../../components/TransactionList/TransactionSwitcher';
import EditTransactionModal from '../../components/TransactionList/EditTransactionModal';
import {IncomeListService} from '../../database/Incomes/incomeDBList';
import {ExpenseQueries} from '../../database/Expense/expenseDBList';
import {ExpenseData, IncomeData} from '../../types/transaction';
import {useIsFocused} from '@react-navigation/native';

const TransactionListScreen = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<number[]>([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<
    IncomeData | ExpenseData | null
  >(null);
  const [allTransactions, setAllTransactions] = useState<
    (IncomeData | ExpenseData)[]
  >([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  }, [isFocused]);

  const handleToggleCheckbox = (id: number) => {
    if (activeTab === 'income') {
      setSelectedIncomeIds(prevIds =>
        prevIds.includes(id) ? prevIds.filter(i => i !== id) : [...prevIds, id],
      );
    } else {
      setSelectedExpenseIds(prevIds =>
        prevIds.includes(id) ? prevIds.filter(i => i !== id) : [...prevIds, id],
      );
    }
  };

  const selectedIds =
    activeTab === 'income' ? selectedIncomeIds : selectedExpenseIds;

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu transaksi untuk dihapus.');
      return;
    }
    Alert.alert(
      'Konfirmasi Hapus',
      `Anda yakin ingin menghapus ${selectedIds.length} transaksi terpilih?`,
      [
        {text: 'Batal', style: 'cancel'},
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'income') {
                await IncomeListService.deleteIncomesByIds(selectedIds);
                setSelectedIncomeIds([]); // ✅ Reset setelah delete
              } else {
                await ExpenseQueries.deleteExpensesByIds(selectedIds);
                setSelectedExpenseIds([]); // ✅ Reset setelah delete
              }
              setRefreshKey(prevKey => prevKey + 1);
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus transaksi.');
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) {
      Alert.alert(
        'Peringatan',
        'Hanya bisa mengubah satu transaksi dalam satu waktu.',
      );
      return;
    }
    const selectedTransaction = allTransactions.find(
      t => t.id === selectedIds[0],
    );
    if (selectedTransaction) {
      setTransactionToEdit(selectedTransaction);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async (updatedData: {
    name: string;
    price: string;
    date: string;
  }) => {
    if (!transactionToEdit) return;

    try {
      const priceNumber = parseFloat(updatedData.price);

      if (activeTab === 'income') {
        await IncomeListService.updateIncomeTransaction(
          transactionToEdit.id,
          updatedData.name,
          priceNumber,
          updatedData.date,
        );
      } else {
        await ExpenseQueries.updateExpenseDetails(
          transactionToEdit.id,
          updatedData.name,
          priceNumber,
          updatedData.date,
        );
      }

      setAllTransactions(currentTransactions => {
        const updated = currentTransactions.map(t =>
          t.id === transactionToEdit.id
            ? {
                ...t,
                description: updatedData.name,
                price: priceNumber,
                amount: priceNumber,
                date: updatedData.date,
              }
            : t,
        );

        updated.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        return updated;
      });

      setEditModalVisible(false);
      setTransactionToEdit(null);
      setSelectedIncomeIds([]);
      setSelectedExpenseIds([]);
      Alert.alert('Sukses', 'Transaksi berhasil diperbarui.');
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Error', 'Gagal memperbarui transaksi.');
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <TransactionHeader
          onDeletePress={handleDelete}
          onEditPress={handleEdit}
          selectionCount={selectedIds.length}
        />
        <TransactionSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedIds={selectedIds}
          onToggleCheckbox={handleToggleCheckbox}
          refreshKey={refreshKey}
          onDataLoaded={setAllTransactions}
          transactions={allTransactions}
        />
      </View>
      {transactionToEdit && (
        <EditTransactionModal
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveEdit}
          transactionData={{
            name: transactionToEdit.description,
            price: transactionToEdit.price,
            date: transactionToEdit.date,
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {flex: 1, backgroundColor: '#fff'},
  container: {flex: 1, paddingHorizontal: 24, paddingTop: 16},
});

export default TransactionListScreen;
