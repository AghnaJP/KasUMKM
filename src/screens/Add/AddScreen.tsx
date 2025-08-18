import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import AddIncome from './AddIncome';
import AddExpense from './AddExpense';
import SwitchBar from '../../components/AddTransaction/SwitchBar';
import MainLayout from '../../components/MainLayout';

const AddScreen = () => {
  const [selectedOption, setSelectedOption] = useState<
    'Pemasukan' | 'Pengeluaran'
  >('Pemasukan');

  return (
    <MainLayout>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <SwitchBar
            options={['Pemasukan', 'Pengeluaran']}
            selected={selectedOption}
            onChange={(value: string) =>
              setSelectedOption(
                value === 'Pemasukan' ? 'Pemasukan' : 'Pengeluaran',
              )
            }
          />

          {selectedOption === 'Pemasukan' ? <AddIncome /> : <AddExpense />}
        </View>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginVertical: 40,
  },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    flexGrow: 1,
  },
});

export default AddScreen;
