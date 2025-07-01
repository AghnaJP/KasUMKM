import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, Alert } from 'react-native';

import TransactionHeader from '../../components/TransactionList/TransactionHeader';
import TransactionSwitcher from '../../components/TransactionList/TransactionSwitcher';
import EditTransactionModal from '../../components/TransactionList/EditTransactionModal';
import { IncomeListService, IncomeData } from '../../database/Incomes/incomeDBList';
import { ExpenseQueries, ExpenseData } from '../../database/Expense/expenseDBList'; 

const TransactionListScreen = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<number[]>([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  
  const [transactionToEdit, setTransactionToEdit] = useState<IncomeData | ExpenseData | null>(null);
  const [allTransactions, setAllTransactions] = useState<(IncomeData | ExpenseData)[]>([]);

  const handleToggleCheckbox = (id: number) => {
    if (activeTab === 'income') {
      setSelectedIncomeIds(prevIds =>
        prevIds.includes(id) ? prevIds.filter(i => i !== id) : [...prevIds, id]
      );
    } else {
      setSelectedExpenseIds(prevIds =>
        prevIds.includes(id) ? prevIds.filter(i => i !== id) : [...prevIds, id]
      );
    }
  };

  const selectedIds = activeTab === 'income' ? selectedIncomeIds : selectedExpenseIds;

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu transaksi untuk dihapus.');
      return;
    }
    Alert.alert(
      'Konfirmasi Hapus',
      `Anda yakin ingin menghapus ${selectedIds.length} transaksi terpilih?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              if (activeTab === 'income') {
                await IncomeListService.deleteIncomesByIds(selectedIds);
                setSelectedIncomeIds([]); 
              } else {
                await ExpenseQueries.deleteExpensesByIds(selectedIds);
                setSelectedExpenseIds([]);
              }
              Alert.alert('Sukses', 'Transaksi berhasil dihapus.');
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
      Alert.alert('Peringatan', 'Hanya bisa mengubah satu transaksi dalam satu waktu.');
      return;
    }
    const selectedTransaction = allTransactions.find(t => t.id === selectedIds[0]);
    if (selectedTransaction) {
      setTransactionToEdit(selectedTransaction);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async (updatedData: { name: string; price: string }) => {
    if (!transactionToEdit) return;
    try {
      const priceNumber = parseFloat(updatedData.price);
      if (activeTab === 'income' && 'menu_id' in transactionToEdit) {
        await IncomeListService.updateMenuDetails(transactionToEdit.menu_id, updatedData.name, priceNumber);
      } else {
        await ExpenseQueries.updateExpenseDetails(transactionToEdit.id, updatedData.name, priceNumber);
      }
      setEditModalVisible(false);
      setTransactionToEdit(null);

      setSelectedIncomeIds([]);
      setSelectedExpenseIds([]);
      setRefreshKey(prevKey => prevKey + 1);
      Alert.alert('Sukses', 'Transaksi berhasil diperbarui.');
    } catch (error) {
      Alert.alert('Error', 'Gagal memperbarui transaksi.');
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.fullWidth}>
          <TransactionHeader
            onDeletePress={handleDelete}
            onEditPress={handleEdit}
            selectionCount={selectedIds.length} 
          />
          <TransactionSwitcher
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
            }}
            selectedIds={selectedIds}
            onToggleCheckbox={handleToggleCheckbox}
            refreshKey={refreshKey}
            onDataLoaded={setAllTransactions}
          />
        </View>
      </View>
      {transactionToEdit && (
        <EditTransactionModal
          visible={isEditModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveEdit}
          transactionData={{
            name: transactionToEdit.description,
            price: transactionToEdit.price,
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
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    width: '100%',
    backgroundColor: '#fff',
  },
  fullWidth: {
    width: '100%',
  },
});

export default TransactionListScreen;