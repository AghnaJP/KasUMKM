import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import {AuthContext} from '../../context/AuthContext';
import ProfitCard from '../../components/Card/ProfitCard';
import TransactionItem from '../../components/TransactionList/TransactionItem';
import {useTransactionList} from '../../hooks/useTransactionList';
import {getAllTransactions} from '../../database/transactions/getAllTransaction';
import type {TransactionData} from '../../types/transaction';

const HomeScreen = () => {
  const {userName} = useContext(AuthContext);
  const [_, setLoaded] = useState<TransactionData[]>([]);

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const currentDate = new Date();
  const selectedMonth = monthNames[currentDate.getMonth()];
  const selectedYear = currentDate.getFullYear().toString();

  const transactions = useTransactionList<TransactionData>(
    getAllTransactions,
    selectedMonth,
    selectedYear,
    setLoaded,
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <CustomText variant="subtitle" style={styles.title}>
        Selamat Sore,
      </CustomText>
      <CustomText variant="title">{userName}</CustomText>

      <ProfitCard />

      <View style={styles.transactionHeader}>
        <CustomText variant="subtitle">Transaksi Hari Ini</CustomText>
        <TouchableOpacity>
          <CustomText variant="caption" color="#007bff" uppercase>
            Lihat Semua
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions.map(item => (
            <TransactionItem
              key={`${item.type}-${item.id}`}
              name={item.name}
              date={new Date(item.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              amount={item.amount}
              type={item.type}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  title: {
    marginTop: 16,
  },
  transactionHeader: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 300,
  },
});

export default HomeScreen;
