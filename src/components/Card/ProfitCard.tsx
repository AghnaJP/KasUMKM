import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../Text/CustomText';
import {COLORS} from '../../constants';
import {useProfitData} from '../../hooks/useProfitData';

const ProfitCard = () => {
  const {menuList, incomeList, expenseList, loading} = useProfitData();

  const totalIncome = incomeList.reduce((sum, income) => {
    const menu = menuList.find(m => m.id === income.menu_id);
    const price = menu?.price || 0;
    return sum + price * income.quantity;
  }, 0);

  const totalExpense = expenseList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const profit = totalIncome - totalExpense;

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomText variant="subtitle" color={COLORS.white}>
          Keuntungan
        </CustomText>
        <CustomText variant="title" color={COLORS.white}>
          Rp {profit.toLocaleString('id-ID') + ',00'}
        </CustomText>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <View style={[styles.iconWrapper]}>
            <Ionicons name="arrow-up" size={16} color="white" />
          </View>
          <View style={styles.textBox}>
            <CustomText variant="caption" color={COLORS.white}>
              Pemasukan
            </CustomText>
            <CustomText variant="caption" color={COLORS.white}>
              Rp {totalIncome.toLocaleString('id-ID')}
            </CustomText>
          </View>
        </View>

        <View style={styles.item}>
          <View style={[styles.iconWrapper]}>
            <Ionicons name="arrow-up" size={16} color="white" />
          </View>
          <View style={styles.textBox}>
            <CustomText variant="caption" color={COLORS.white}>
              Pengeluaran
            </CustomText>
            <CustomText variant="caption" color={COLORS.white}>
              Rp {totalExpense.toLocaleString('id-ID')}
            </CustomText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#003E9C',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  header: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textBox: {
    marginLeft: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0065D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  loadingWrapper: {
    padding: 20,
    backgroundColor: '#003E9C',
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
});

export default ProfitCard;
