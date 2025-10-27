import React, {useState, useCallback} from 'react';
import {StyleSheet, SafeAreaView, View, Alert} from 'react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {AppTabParamList} from '../../types/navigation';

import TransactionHeader from '../../components/TransactionList/TransactionHeader';
import TransactionSwitcher from '../../components/TransactionList/TransactionSwitcher';
import EditTransactionModal from '../../components/TransactionList/EditTransactionModal';

import {
  getUnifiedIncomeDetails,
  getUnifiedExpenseDetails,
  updateUnifiedByRowId,
  type IncomeData,
  type ExpenseData,
  getUnifiedOneByRowId,
  softDeleteUnifiedByRowId,
} from '../../database/transactions/unifiedForWallet';
import {ID} from '../../types/menu';

type AnyTx = IncomeData | ExpenseData;

const WalletScreen = () => {
  const route = useRoute<RouteProp<AppTabParamList, 'Wallet'>>();

  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<AnyTx | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  React.useEffect(() => {
    const tab = route.params?.initialTab;
    if (tab && tab !== activeTab) {setActiveTab(tab);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.initialTab]);

  const getIncomes = useCallback(() => getUnifiedIncomeDetails(), []);
  const getExpenses = useCallback(() => getUnifiedExpenseDetails(), []);

  const handleEdit = async (item: AnyTx) => {
    try {
      const fresh = await getUnifiedOneByRowId(Number(item.id));
      setTransactionToEdit(fresh);
      setEditModalVisible(true);
    } catch {
      setTransactionToEdit(item);
      setEditModalVisible(true);
    }
  };

  const handleDelete = async (rowId: ID) => {
    try {
      await softDeleteUnifiedByRowId(rowId);
      Alert.alert('Sukses', 'Transaksi dihapus.');
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      console.log('softDeleteUnifiedByRowId failed:', e);
      Alert.alert('Error', 'Gagal menghapus transaksi.');
    }
  };

  const handleSaveEdit = async (updatedData: {
    description: string;
    price: string;
    quantity: string;
    date: string;
  }) => {
    if (!transactionToEdit) {return;}

    try {
      const rowId = Number(transactionToEdit.id);
      const priceNum = Number(updatedData.price);
      const qtyNum = Number(updatedData.quantity || 1);

      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        Alert.alert('Validasi', 'Harga harus lebih dari 0.');
        return;
      }
      if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
        Alert.alert('Validasi', 'Jumlah harus lebih dari 0.');
        return;
      }

      await updateUnifiedByRowId(rowId, {
        description: updatedData.description,
        price: priceNum,
        quantity: qtyNum,
        date: updatedData.date,
      });

      setEditModalVisible(false);
      setTransactionToEdit(null);
      setRefreshKey(prev => prev + 1);
      Alert.alert('Sukses', 'Transaksi berhasil diperbarui.');
    } catch (e) {
      console.log('edit unified error', e);
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
  container: {flex: 1, width: '100%', backgroundColor: '#fff'},
  fullWidth: {flex: 1, width: '100%'},
});

export default WalletScreen;
